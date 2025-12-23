"""Directory Service - 目录业务逻辑层"""

import logging
from typing import List, Iterator

from apps.asset.repositories import DjangoDirectoryRepository
from apps.asset.dtos import DirectoryDTO

logger = logging.getLogger(__name__)


class DirectoryService:
    """目录业务逻辑层"""
    
    def __init__(self, repository=None):
        """初始化目录服务"""
        self.repo = repository or DjangoDirectoryRepository()
    
    def bulk_upsert(self, directory_dtos: List[DirectoryDTO]) -> int:
        """
        批量创建或更新目录（upsert）
        
        存在则更新所有字段，不存在则创建。
        
        Args:
            directory_dtos: DirectoryDTO 列表
            
        Returns:
            int: 处理的记录数
        """
        if not directory_dtos:
            return 0
        
        try:
            return self.repo.bulk_upsert(directory_dtos)
        except Exception as e:
            logger.error(f"批量 upsert 目录失败: {e}")
            raise
    
    def get_directories_by_target(self, target_id: int):
        """获取目标下的所有目录"""
        return self.repo.get_by_target(target_id)
    
    def get_all(self):
        """获取所有目录"""
        return self.repo.get_all()

    def iter_directory_urls_by_target(self, target_id: int, chunk_size: int = 1000) -> Iterator[str]:
        """流式获取目标下的所有目录 URL"""
        return self.repo.get_urls_for_export(target_id=target_id, batch_size=chunk_size)

    def iter_raw_data_for_csv_export(self, target_id: int) -> Iterator[dict]:
        """
        流式获取原始数据用于 CSV 导出
        
        Args:
            target_id: 目标 ID
        
        Yields:
            原始数据字典
        """
        return self.repo.iter_raw_data_for_export(target_id=target_id)


__all__ = ['DirectoryService']
