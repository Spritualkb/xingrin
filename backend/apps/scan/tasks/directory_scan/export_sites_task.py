"""
导出站点 URL 到 TXT 文件的 Task

使用流式处理，避免大量站点导致内存溢出
支持默认值模式：如果没有站点，根据 Target 类型生成默认 URL
- DOMAIN: http(s)://target_name
- IP: http(s)://ip
- CIDR: 展开为所有 IP 的 http(s)://ip
"""
import logging
import ipaddress
from pathlib import Path
from prefect import task

from apps.asset.repositories import DjangoWebSiteRepository
from apps.targets.services import TargetService
from apps.targets.models import Target

logger = logging.getLogger(__name__)


@task(name="export_sites")
def export_sites_task(
    target_id: int,
    output_file: str,
    batch_size: int = 1000,
    target_name: str = None
) -> dict:
    """
    导出目标下的所有站点 URL 到 TXT 文件

    使用流式处理，支持大规模数据导出（10万+站点）
    支持默认值模式：如果没有站点，自动使用默认站点 URL（http(s)://target_name）

    Args:
        target_id: 目标 ID
        output_file: 输出文件路径（绝对路径）
        batch_size: 每次读取的批次大小，默认 1000
        target_name: 目标名称（用于默认值模式）

    Returns:
        dict: {
            'success': bool,
            'output_file': str,
            'total_count': int
        }

    Raises:
        ValueError: 参数错误
        IOError: 文件写入失败
    """
    try:
        # 初始化 Repository
        repository = DjangoWebSiteRepository()

        logger.info("开始导出站点 URL - Target ID: %d, 输出文件: %s", target_id, output_file)

        # 确保输出目录存在
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # 使用 Repository 流式查询站点 URL
        url_iterator = repository.get_urls_for_export(
            target_id=target_id,
            batch_size=batch_size
        )

        # 流式写入文件
        total_count = 0
        with open(output_path, 'w', encoding='utf-8', buffering=8192) as f:
            for url in url_iterator:
                # 每次只处理一个 URL，边读边写
                f.write(f"{url}\n")
                total_count += 1

                # 每写入 10000 条记录打印一次进度
                if total_count % 10000 == 0:
                    logger.info("已导出 %d 个站点 URL...", total_count)

        # ==================== 懒加载模式：根据 Target 类型生成默认 URL ====================
        if total_count == 0:
            total_count = _write_default_urls(target_id, target_name, output_path)

        logger.info(
            "✓ 站点 URL 导出完成 - 总数: %d, 文件: %s (%.2f KB)",
            total_count,
            str(output_path),  # 使用绝对路径
            output_path.stat().st_size / 1024
        )

        return {
            'success': True,
            'output_file': str(output_path),
            'total_count': total_count
        }

    except FileNotFoundError as e:
        logger.error("输出目录不存在: %s", e)
        raise
    except PermissionError as e:
        logger.error("文件写入权限不足: %s", e)
        raise
    except Exception as e:
        logger.exception("导出站点 URL 失败: %s", e)
        raise


def _write_default_urls(target_id: int, target_name: str, output_path: Path) -> int:
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



