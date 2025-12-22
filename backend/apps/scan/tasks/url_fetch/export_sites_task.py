"""
导出站点 URL 列表任务

从 WebSite 表导出站点 URL 列表到文件（用于 katana 等爬虫工具）

使用流式写入，避免内存溢出

懒加载模式：
- 如果 WebSite 表为空，根据 Target 类型生成默认 URL
- DOMAIN: 写入 http(s)://domain
- IP: 写入 http(s)://ip
- CIDR: 展开为所有 IP
"""

import logging
import ipaddress
from pathlib import Path
from prefect import task
from typing import Optional

from apps.targets.services import TargetService
from apps.targets.models import Target

logger = logging.getLogger(__name__)


@task(
    name='export_sites_for_url_fetch',
    retries=1,
    log_prints=True
)
def export_sites_task(
    output_file: str,
    target_id: int,
    scan_id: int,
    target_name: Optional[str] = None,
    batch_size: int = 1000
) -> dict:
    """
    导出站点 URL 列表到文件（用于 katana 等爬虫工具）
    
    懒加载模式：
    - 如果 WebSite 表为空，根据 Target 类型生成默认 URL
    - 数据库只存储"真实发现"的资产
    
    Args:
        output_file: 输出文件路径
        target_id: 目标 ID
        scan_id: 扫描 ID
        target_name: 目标名称（用于懒加载时写入默认值）
        batch_size: 批次大小（内存优化）
        
    Returns:
        dict: {
            'output_file': str,  # 输出文件路径
            'asset_count': int,  # 资产数量
        }
        
    Raises:
        ValueError: 参数错误
        RuntimeError: 执行失败
    """
    try:
        logger.info("开始导出站点 URL 列表 - Target ID: %d", target_id)
        
        # 确保输出目录存在
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 从 WebSite 表导出站点 URL
        from apps.asset.services import WebSiteService
        
        website_service = WebSiteService()
        
        # 流式写入文件
        asset_count = 0
        with open(output_path, 'w') as f:
            for url in website_service.iter_website_urls_by_target(target_id, batch_size):
                f.write(f"{url}\n")
                asset_count += 1
                
                if asset_count % batch_size == 0:
                    f.flush()
        
        # ==================== 懒加载模式：根据 Target 类型生成默认 URL ====================
        if asset_count == 0:
            asset_count = _write_default_urls(target_id, target_name, output_path)
        
        logger.info("✓ 站点 URL 导出完成 - 文件: %s, 数量: %d", output_file, asset_count)
        
        return {
            'output_file': output_file,
            'asset_count': asset_count,
        }
        
    except Exception as e:
        logger.error("导出站点 URL 失败: %s", e, exc_info=True)
        raise RuntimeError(f"导出站点 URL 失败: {e}") from e


def _write_default_urls(target_id: int, target_name: Optional[str], output_path: Path) -> int:
    """
    懒加载模式：根据 Target 类型生成默认 URL 列表
    
    Args:
        target_id: 目标 ID
        target_name: 目标名称
        output_path: 输出文件路径
        
    Returns:
        int: 生成的 URL 数量
    """
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
            f.write(f"http://{target_name}\n")
            f.write(f"https://{target_name}\n")
            total_urls = 2
            logger.info("✓ 域名默认 URL 已写入: http(s)://%s", target_name)
            
        elif target_type == Target.TargetType.IP:
            f.write(f"http://{target_name}\n")
            f.write(f"https://{target_name}\n")
            total_urls = 2
            logger.info("✓ IP 默认 URL 已写入: http(s)://%s", target_name)
            
        elif target_type == Target.TargetType.CIDR:
            try:
                network = ipaddress.ip_network(target_name, strict=False)
                
                for ip in network.hosts():
                    f.write(f"http://{ip}\n")
                    f.write(f"https://{ip}\n")
                    total_urls += 2
                    
                    if total_urls % 10000 == 0:
                        logger.info("已生成 %d 个 URL...", total_urls)
                
                # /32 或 /128 特殊处理
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
