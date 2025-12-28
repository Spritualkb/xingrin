"""初始化内置指纹库

- EHole 指纹: ehole.json -> 导入到数据库
- Goby 指纹: goby.json -> 导入到数据库
- Wappalyzer 指纹: wappalyzer.json -> 导入到数据库

可重复执行：如果数据库已有数据则跳过，只在空库时导入。
"""

import json
import logging
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.engine.models import EholeFingerprint, GobyFingerprint, WappalyzerFingerprint
from apps.engine.services.fingerprints import (
    EholeFingerprintService,
    GobyFingerprintService,
    WappalyzerFingerprintService,
)


logger = logging.getLogger(__name__)


# 内置指纹配置
DEFAULT_FINGERPRINTS = [
    {
        "type": "ehole",
        "filename": "ehole.json",
        "model": EholeFingerprint,
        "service": EholeFingerprintService,
        "data_key": "fingerprint",  # JSON 中指纹数组的 key
    },
    {
        "type": "goby",
        "filename": "goby.json",
        "model": GobyFingerprint,
        "service": GobyFingerprintService,
        "data_key": None,  # Goby 是数组格式，直接使用整个 JSON
    },
    {
        "type": "wappalyzer",
        "filename": "wappalyzer.json",
        "model": WappalyzerFingerprint,
        "service": WappalyzerFingerprintService,
        "data_key": "apps",  # Wappalyzer 使用 apps 对象
    },
]


class Command(BaseCommand):
    help = "初始化内置指纹库"

    def handle(self, *args, **options):
        project_base = Path(settings.BASE_DIR).parent  # /app/backend -> /app
        fingerprints_dir = project_base / "backend" / "fingerprints"

        initialized = 0
        skipped = 0
        failed = 0

        for item in DEFAULT_FINGERPRINTS:
            fp_type = item["type"]
            filename = item["filename"]
            model = item["model"]
            service_class = item["service"]
            data_key = item["data_key"]

            # 检查数据库是否已有数据
            existing_count = model.objects.count()
            if existing_count > 0:
                self.stdout.write(self.style.SUCCESS(
                    f"[{fp_type}] 数据库已有 {existing_count} 条记录，跳过初始化"
                ))
                skipped += 1
                continue

            # 查找源文件
            src_path = fingerprints_dir / filename
            if not src_path.exists():
                self.stdout.write(self.style.WARNING(
                    f"[{fp_type}] 未找到内置指纹文件: {src_path}，跳过"
                ))
                failed += 1
                continue

            # 读取并解析 JSON
            try:
                with open(src_path, "r", encoding="utf-8") as f:
                    json_data = json.load(f)
            except (json.JSONDecodeError, OSError) as exc:
                self.stdout.write(self.style.ERROR(
                    f"[{fp_type}] 读取指纹文件失败: {exc}"
                ))
                failed += 1
                continue

            # 提取指纹数据（根据不同格式处理）
            fingerprints = self._extract_fingerprints(json_data, data_key, fp_type)
            if not fingerprints:
                self.stdout.write(self.style.WARNING(
                    f"[{fp_type}] 指纹文件中没有有效数据，跳过"
                ))
                failed += 1
                continue

            # 使用 Service 批量导入
            try:
                service = service_class()
                result = service.batch_create_fingerprints(fingerprints)
                created = result.get("created", 0)
                failed_count = result.get("failed", 0)

                self.stdout.write(self.style.SUCCESS(
                    f"[{fp_type}] 导入成功: 创建 {created} 条，失败 {failed_count} 条"
                ))
                initialized += 1
            except Exception as exc:
                self.stdout.write(self.style.ERROR(
                    f"[{fp_type}] 导入失败: {exc}"
                ))
                failed += 1
                continue

        self.stdout.write(self.style.SUCCESS(
            f"指纹初始化完成: 成功 {initialized}, 已存在跳过 {skipped}, 失败 {failed}"
        ))

    def _extract_fingerprints(self, json_data, data_key, fp_type):
        """
        根据不同格式提取指纹数据，兼容数组和对象两种格式
        
        支持的格式：
        - 数组格式: [...] 或 {"key": [...]}
        - 对象格式: {...} 或 {"key": {...}} -> 转换为 [{"name": k, ...v}]
        """
        # 获取目标数据
        if data_key is None:
            # 直接使用整个 JSON
            target = json_data
        else:
            # 从指定 key 获取，支持多个可能的 key（如 apps/technologies）
            if data_key == "apps":
                target = json_data.get("apps") or json_data.get("technologies") or {}
            else:
                target = json_data.get(data_key, [])
        
        # 根据数据类型处理
        if isinstance(target, list):
            # 已经是数组格式，直接返回
            return target
        elif isinstance(target, dict):
            # 对象格式，转换为数组 [{"name": key, ...value}]
            return [{"name": name, **data} if isinstance(data, dict) else {"name": name}
                    for name, data in target.items()]
        
        return []
