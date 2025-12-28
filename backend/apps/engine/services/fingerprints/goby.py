"""Goby 指纹管理 Service

实现 Goby 格式指纹的校验、转换和导出逻辑
"""

from apps.engine.models import GobyFingerprint
from .base import BaseFingerprintService


class GobyFingerprintService(BaseFingerprintService):
    """Goby 指纹管理服务（继承基类，实现 Goby 特定逻辑）"""
    
    model = GobyFingerprint
    
    def validate_fingerprint(self, item: dict) -> bool:
        """
        校验单条 Goby 指纹
        
        校验规则：
        - name 字段必须存在且非空
        - logic 字段必须存在
        - rule 字段必须是数组
        
        Args:
            item: 单条指纹数据
            
        Returns:
            bool: 是否有效
        """
        name = item.get('name', '')
        logic = item.get('logic', '')
        rule = item.get('rule')
        return bool(name and str(name).strip()) and bool(logic) and isinstance(rule, list)
    
    def to_model_data(self, item: dict) -> dict:
        """
        转换 Goby JSON 格式为 Model 字段
        
        Args:
            item: 原始 Goby JSON 数据
            
        Returns:
            dict: Model 字段数据
        """
        return {
            'name': str(item.get('name', '')).strip(),
            'logic': item.get('logic', ''),
            'rule': item.get('rule', []),
        }
    
    def get_export_data(self) -> list:
        """
        获取导出数据（Goby JSON 格式 - 数组）
        
        Returns:
            list: Goby 格式的 JSON 数据（数组格式）
            [
                {"name": "...", "logic": "...", "rule": [...]},
                ...
            ]
        """
        fingerprints = self.model.objects.all()
        return [
            {
                'name': fp.name,
                'logic': fp.logic,
                'rule': fp.rule,
            }
            for fp in fingerprints
        ]
