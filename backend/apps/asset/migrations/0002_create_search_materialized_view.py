"""
创建资产搜索 IMMV（增量维护物化视图）

使用 pg_ivm 扩展创建 IMMV，数据变更时自动增量更新，无需手动刷新。
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('asset', '0001_initial'),
    ]

    operations = [
        # 1. 确保 pg_ivm 扩展已启用
        migrations.RunSQL(
            sql="CREATE EXTENSION IF NOT EXISTS pg_ivm;",
            reverse_sql="-- pg_ivm extension kept for other uses"
        ),
        
        # 2. 使用 pg_ivm 创建 IMMV
        migrations.RunSQL(
            sql="""
                SELECT pgivm.create_immv('asset_search_view', $$
                    SELECT 
                        w.id,
                        w.url,
                        w.host,
                        w.title,
                        w.tech,
                        w.status_code,
                        w.response_headers,
                        w.response_body,
                        w.created_at,
                        w.target_id
                    FROM website w
                $$);
            """,
            reverse_sql="SELECT pgivm.drop_immv('asset_search_view');"
        ),
        
        # 3. 创建唯一索引（用于标识）
        migrations.RunSQL(
            sql="""
                CREATE UNIQUE INDEX IF NOT EXISTS asset_search_view_id_idx 
                ON asset_search_view (id);
            """,
            reverse_sql="""
                DROP INDEX IF EXISTS asset_search_view_id_idx;
            """
        ),
        
        # 4. 创建搜索优化索引
        migrations.RunSQL(
            sql="""
                -- host 模糊搜索索引
                CREATE INDEX IF NOT EXISTS asset_search_view_host_trgm_idx 
                ON asset_search_view USING gin (host gin_trgm_ops);
                
                -- title 模糊搜索索引
                CREATE INDEX IF NOT EXISTS asset_search_view_title_trgm_idx 
                ON asset_search_view USING gin (title gin_trgm_ops);
                
                -- url 模糊搜索索引
                CREATE INDEX IF NOT EXISTS asset_search_view_url_trgm_idx 
                ON asset_search_view USING gin (url gin_trgm_ops);
                
                -- response_headers 模糊搜索索引
                CREATE INDEX IF NOT EXISTS asset_search_view_headers_trgm_idx 
                ON asset_search_view USING gin (response_headers gin_trgm_ops);
                
                -- response_body 模糊搜索索引
                CREATE INDEX IF NOT EXISTS asset_search_view_body_trgm_idx 
                ON asset_search_view USING gin (response_body gin_trgm_ops);
                
                -- tech 数组索引
                CREATE INDEX IF NOT EXISTS asset_search_view_tech_idx 
                ON asset_search_view USING gin (tech);
                
                -- status_code 索引
                CREATE INDEX IF NOT EXISTS asset_search_view_status_idx 
                ON asset_search_view (status_code);
                
                -- created_at 排序索引
                CREATE INDEX IF NOT EXISTS asset_search_view_created_idx 
                ON asset_search_view (created_at DESC);
            """,
            reverse_sql="""
                DROP INDEX IF EXISTS asset_search_view_host_trgm_idx;
                DROP INDEX IF EXISTS asset_search_view_title_trgm_idx;
                DROP INDEX IF EXISTS asset_search_view_url_trgm_idx;
                DROP INDEX IF EXISTS asset_search_view_headers_trgm_idx;
                DROP INDEX IF EXISTS asset_search_view_body_trgm_idx;
                DROP INDEX IF EXISTS asset_search_view_tech_idx;
                DROP INDEX IF EXISTS asset_search_view_status_idx;
                DROP INDEX IF EXISTS asset_search_view_created_idx;
            """
        ),
    ]
