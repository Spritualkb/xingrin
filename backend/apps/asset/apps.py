import logging
import sys

from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AssetConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.asset'
    
    def ready(self):
        # 导入所有模型以确保Django发现并注册
        from . import models
        
        # 启用 pg_trgm 扩展（用于文本模糊搜索索引）
        # 用于已有数据库升级场景
        self._ensure_pg_trgm_extension()
        
        # 验证 pg_ivm 扩展是否可用（用于 IMMV 增量维护）
        self._verify_pg_ivm_extension()
    
    def _ensure_pg_trgm_extension(self):
        """
        确保 pg_trgm 扩展已启用。
        该扩展用于 response_body 和 response_headers 字段的 GIN 索引，
        支持高效的文本模糊搜索。
        """
        from django.db import connection
        
        # 检查是否为 PostgreSQL 数据库
        if connection.vendor != 'postgresql':
            logger.debug("跳过 pg_trgm 扩展：当前数据库不是 PostgreSQL")
            return
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
                logger.debug("pg_trgm 扩展已启用")
        except Exception as e:
            # 记录错误但不阻止应用启动
            # 常见原因：权限不足（需要超级用户权限）
            logger.warning(
                "无法创建 pg_trgm 扩展: %s。"
                "这可能导致 response_body 和 response_headers 字段的 GIN 索引无法正常工作。"
                "请手动执行: CREATE EXTENSION IF NOT EXISTS pg_trgm;",
                str(e)
            )
    
    def _verify_pg_ivm_extension(self):
        """
        验证 pg_ivm 扩展是否可用。
        pg_ivm 用于 IMMV（增量维护物化视图），是系统必需的扩展。
        如果不可用，将记录错误并退出。
        """
        from django.db import connection
        
        # 检查是否为 PostgreSQL 数据库
        if connection.vendor != 'postgresql':
            logger.debug("跳过 pg_ivm 验证：当前数据库不是 PostgreSQL")
            return
        
        # 跳过某些管理命令（如 migrate、makemigrations）
        import sys
        if len(sys.argv) > 1 and sys.argv[1] in ('migrate', 'makemigrations', 'collectstatic', 'check'):
            logger.debug("跳过 pg_ivm 验证：当前为管理命令")
            return
        
        try:
            with connection.cursor() as cursor:
                # 检查 pg_ivm 扩展是否已安装
                cursor.execute("""
                    SELECT COUNT(*) FROM pg_extension WHERE extname = 'pg_ivm'
                """)
                count = cursor.fetchone()[0]
                
                if count > 0:
                    logger.info("✓ pg_ivm 扩展已启用")
                else:
                    # 尝试创建扩展
                    try:
                        cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_ivm;")
                        logger.info("✓ pg_ivm 扩展已创建并启用")
                    except Exception as create_error:
                        logger.error(
                            "=" * 60 + "\n"
                            "错误: pg_ivm 扩展未安装\n"
                            "=" * 60 + "\n"
                            "pg_ivm 是系统必需的扩展，用于增量维护物化视图。\n\n"
                            "请在 PostgreSQL 服务器上安装 pg_ivm：\n"
                            "  curl -sSL https://raw.githubusercontent.com/yyhuni/xingrin/main/docker/scripts/install-pg-ivm.sh | sudo bash\n\n"
                            "或手动安装：\n"
                            "  1. apt install build-essential postgresql-server-dev-15 git\n"
                            "  2. git clone https://github.com/sraoss/pg_ivm.git && cd pg_ivm && make && make install\n"
                            "  3. 在 postgresql.conf 中添加: shared_preload_libraries = 'pg_ivm'\n"
                            "  4. 重启 PostgreSQL\n"
                            "=" * 60
                        )
                        # 在生产环境中退出，开发环境中仅警告
                        from django.conf import settings
                        if not settings.DEBUG:
                            sys.exit(1)
                        
        except Exception as e:
            logger.error(f"pg_ivm 扩展验证失败: {e}")
