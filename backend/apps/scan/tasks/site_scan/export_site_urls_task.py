"""
导出站点URL到文件的Task

直接使用 HostPortMapping 表查询 host+port 组合，拼接成URL格式写入文件

默认值模式：
- 如果没有 HostPortMapping 数据，写入默认 URL 到文件（不写入数据库）
- DOMAIN: http(s)://target_name
- IP: http(s)://ip
- CIDR: 展开为所有 IP 的 http(s)://ip
"""
import logging
import ipaddress
from pathlib import Path
from prefect import task
from typing import Optional

from apps.asset.services import HostPortMappingService
from apps.targets.services import TargetService
from apps.targets.models import Target

logger = logging.getLogger(__name__)


@task(name="export_site_urls")
def export_site_urls_task(
    target_id: int,
    output_file: str,
    target_name: Optional[str] = None,
    batch_size: int = 1000
) -> dict:
    """
    导出目标下的所有站点URL到文件（基于 HostPortMapping 表）
    
    功能：
    1. 从 HostPortMapping 表查询 target 下所有 host+port 组合
    2. 拼接成URL格式（标准端口80/443将省略端口号）
    3. 写入到指定文件中
    
    默认值模式（懒加载）：
    - 如果没有 HostPortMapping 数据，根据 Target 类型生成默认 URL
    - DOMAIN: http(s)://target_name
    - IP: http(s)://ip
    - CIDR: 展开为所有 IP 的 http(s)://ip
    
    Args:
        target_id: 目标ID
        output_file: 输出文件路径（绝对路径）
        target_name: 目标名称（用于懒加载时写入默认值）
        batch_size: 每次处理的批次大小，默认1000（暂未使用，预留）
        
    Returns:
        dict: {
            'success': bool,
            'output_file': str,
            'total_urls': int,
            'association_count': int  # 主机端口关联数量
        }
        
    Raises:
        ValueError: 参数错误
        IOError: 文件写入失败
    """
    try:
        logger.info("开始统计站点URL - Target ID: %d, 输出文件: %s", target_id, output_file)
        
        # 确保输出目录存在
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 直接查询 HostPortMapping 表，按 host 排序
        service = HostPortMappingService()
        associations = service.iter_host_port_by_target(
            target_id=target_id,
            batch_size=batch_size,
        )
        
        total_urls = 0
        association_count = 0
        
        # 流式写入文件
        with open(output_path, 'w', encoding='utf-8', buffering=8192) as f:
            for assoc in associations:
                association_count += 1
                host = assoc['host']
                port = assoc['port']
                
                # 根据端口号生成URL
                # 80 端口：只生成 HTTP URL（省略端口号）
                # 443 端口：只生成 HTTPS URL（省略端口号）
                # 其他端口：生成 HTTP 和 HTTPS 两个URL（带端口号）
                if port == 80:
                    # HTTP 标准端口，省略端口号
                    url = f"http://{host}"
                    f.write(f"{url}\n")
                    total_urls += 1
                elif port == 443:
                    # HTTPS 标准端口，省略端口号
                    url = f"https://{host}"
                    f.write(f"{url}\n")
                    total_urls += 1
                else:
                    # 非标准端口，生成 HTTP 和 HTTPS 两个URL
                    http_url = f"http://{host}:{port}"
                    https_url = f"https://{host}:{port}"
                    f.write(f"{http_url}\n")
                    f.write(f"{https_url}\n")
                    total_urls += 2
                
                # 每处理1000条记录打印一次进度
                if association_count % 1000 == 0:
                    logger.info("已处理 %d 条关联，生成 %d 个URL...", association_count, total_urls)
        
        logger.info(
            "✓ 站点URL导出完成 - 关联数: %d, 总URL数: %d, 文件: %s (%.2f KB)",
            association_count,
            total_urls,
            str(output_path),
            output_path.stat().st_size / 1024
        )
        
        # ==================== 懒加载模式：根据 Target 类型生成默认 URL ====================
        if total_urls == 0:
            total_urls = _write_default_urls(target_id, target_name, output_path)
        
        return {
            'success': True,
            'output_file': str(output_path),
            'total_urls': total_urls,
            'association_count': association_count
        }
        
    except FileNotFoundError as e:
        logger.error("输出目录不存在: %s", e)
        raise
    except PermissionError as e:
        logger.error("文件写入权限不足: %s", e)
        raise
    except Exception as e:
        logger.exception("导出站点URL失败: %s", e)
        raise


def _write_default_urls(target_id: int, target_name: Optional[str], output_path: Path) -> int:
    """
    懒加载模式：根据 Target 类型生成默认 URL
    
    Args:
        target_id: 目标 ID
        target_name: 目标名称（可选，如果为空则从数据库查询）
        output_path: 输出文件路径
        
    Returns:
        int: 生成的 URL 数量
    """
    # 获取 Target 信息
    target_service = TargetService()
    target = target_service.get_target(target_id)
    
    if not target:
        logger.warning("Target ID %d 不存在，无法生成默认 URL", target_id)
        return 0
    
    target_name = target.name
    target_type = target.type
    
    logger.info("懒加载模式：Target 类型=%s, 名称=%s", target_type, target_name)
    
    total_urls = 0
    
    with open(output_path, 'w', encoding='utf-8', buffering=8192) as f:
        if target_type == Target.TargetType.DOMAIN:
            # 域名类型：生成 http(s)://domain
            f.write(f"http://{target_name}\n")
            f.write(f"https://{target_name}\n")
            total_urls = 2
            logger.info("✓ 域名默认 URL 已写入: http(s)://%s", target_name)
            
        elif target_type == Target.TargetType.IP:
            # IP 类型：生成 http(s)://ip
            f.write(f"http://{target_name}\n")
            f.write(f"https://{target_name}\n")
            total_urls = 2
            logger.info("✓ IP 默认 URL 已写入: http(s)://%s", target_name)
            
        elif target_type == Target.TargetType.CIDR:
            # CIDR 类型：展开为所有 IP 的 URL
            try:
                network = ipaddress.ip_network(target_name, strict=False)
                
                for ip in network.hosts():  # 排除网络地址和广播地址
                    f.write(f"http://{ip}\n")
                    f.write(f"https://{ip}\n")
                    total_urls += 2
                    
                    if total_urls % 10000 == 0:
                        logger.info("已生成 %d 个 URL...", total_urls)
                
                # 如果是 /32 或 /128（单个 IP），hosts() 会为空
                if total_urls == 0:
                    ip = str(network.network_address)
                    f.write(f"http://{ip}\n")
                    f.write(f"https://{ip}\n")
                    total_urls = 2
                
                logger.info("✓ CIDR 默认 URL 已写入: %d 个 URL (来自 %s)", total_urls, target_name)
                
            except ValueError as e:
                logger.error("CIDR 解析失败: %s - %s", target_name, e)
                return 0
        else:
            logger.warning("不支持的 Target 类型: %s", target_type)
            return 0
    
    return total_urls
