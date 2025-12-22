#!/usr/bin/env python3
"""
直接通过 SQL 插入测试数据

用法：
    python scripts/generate_test_data_sql.py
    python scripts/generate_test_data_sql.py --clear  # 清除后重新生成
"""

import argparse
import random
import json
from datetime import datetime, timedelta
from decimal import Decimal

import psycopg2
from psycopg2.extras import execute_values

# 数据库配置（从 docker/.env 读取）
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'dbname': 'xingrin',
    'user': 'postgres',
    'password': '0af235510cbd4cc17cca346a47358def',
}


class TestDataGenerator:
    def __init__(self, clear: bool = False):
        self.conn = psycopg2.connect(**DB_CONFIG)
        self.conn.autocommit = False
        self.clear = clear
        
    def run(self):
        try:
            if self.clear:
                print("🗑️  清除现有数据...")
                self.clear_data()
                
            print("🚀 开始生成测试数据...\n")
            
            engine_ids = self.create_engines()
            worker_ids = self.create_workers()
            org_ids = self.create_organizations()
            target_ids = self.create_targets(org_ids)
            scan_ids = self.create_scans(target_ids, engine_ids, worker_ids)
            self.create_scheduled_scans(org_ids, target_ids, engine_ids)
            self.create_subdomains(target_ids)
            website_ids = self.create_websites(target_ids)
            self.create_endpoints(target_ids)
            self.create_directories(target_ids, website_ids)
            self.create_host_port_mappings(target_ids)
            self.create_vulnerabilities(target_ids)
            
            self.conn.commit()
            print("\n✅ 测试数据生成完成！")
        except Exception as e:
            self.conn.rollback()
            print(f"\n❌ 生成失败: {e}")
            raise
        finally:
            self.conn.close()

    def clear_data(self):
        """清除所有测试数据"""
        cur = self.conn.cursor()
        tables = [
            'vulnerability', 'host_port_mapping', 'directory', 'endpoint',
            'website', 'subdomain', 'scheduled_scan', 'scan',
            'organization_targets', 'target', 'organization',
            'nuclei_template_repo', 'wordlist', 'scan_engine', 'worker_node'
        ]
        for table in tables:
            cur.execute(f"DELETE FROM {table}")
        self.conn.commit()
        print("  ✓ 数据清除完成\n")

    def create_workers(self) -> list:
        """创建 Worker 节点"""
        print("👷 创建 Worker 节点...")
        cur = self.conn.cursor()
        
        workers = [
            ('local-worker-primary-node-for-internal-scanning-tasks', '127.0.0.1', True, 'online'),
            ('remote-worker-asia-pacific-region-singapore-datacenter-01', '192.168.1.100', False, 'online'),
            ('remote-worker-europe-west-region-frankfurt-datacenter-02', '192.168.1.101', False, 'offline'),
            ('remote-worker-north-america-east-region-virginia-datacenter-03', '192.168.1.102', False, 'pending'),
            ('remote-worker-asia-pacific-region-tokyo-datacenter-04', '192.168.1.103', False, 'deploying'),
        ]
        
        ids = []
        for name, ip, is_local, status in workers:
            cur.execute("""
                INSERT INTO worker_node (name, ip_address, ssh_port, username, password, is_local, status, created_at, updated_at)
                VALUES (%s, %s, 22, 'root', '', %s, %s, NOW(), NOW())
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (name, ip, is_local, status))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
                
        print(f"  ✓ 创建了 {len(ids)} 个 Worker 节点\n")
        return ids

    def create_engines(self) -> list:
        """创建扫描引擎"""
        print("⚙️  创建扫描引擎...")
        cur = self.conn.cursor()
        
        engines = [
            ('Full-Comprehensive-Security-Assessment-Engine-With-All-Modules-Enabled', 'subdomain_discovery:\n  enabled: true\n  tools: [subfinder, amass]\nvulnerability_scanning:\n  enabled: true'),
            ('Quick-Reconnaissance-Engine-For-Fast-Surface-Discovery-Only', 'subdomain_discovery:\n  enabled: true\n  tools: [subfinder]\n  timeout: 600'),
            ('Deep-Vulnerability-Assessment-Engine-With-Extended-Nuclei-Templates', 'vulnerability_scanning:\n  enabled: true\n  nuclei:\n    severity: critical,high,medium,low,info'),
            ('Passive-Information-Gathering-Engine-No-Active-Probing', 'subdomain_discovery:\n  enabled: true\n  passive_only: true'),
        ]
        
        ids = []
        for name, config in engines:
            cur.execute("""
                INSERT INTO scan_engine (name, configuration, created_at, updated_at)
                VALUES (%s, %s, NOW(), NOW())
                ON CONFLICT (name) DO NOTHING
                RETURNING id
            """, (name, config))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
                
        print(f"  ✓ 创建了 {len(ids)} 个扫描引擎\n")
        return ids

    def create_organizations(self) -> list:
        """创建组织"""
        print("🏢 创建组织...")
        cur = self.conn.cursor()
        
        orgs = [
            ('Acme Corporation International Holdings Limited - Global Technology Division', '全球领先的技术解决方案提供商，专注于企业级软件开发、云计算服务和网络安全解决方案。'),
            ('TechStart Innovation Labs - Research and Development Center', '专注于人工智能、机器学习和区块链技术研发的创新实验室。'),
            ('Global Financial Services Group - Digital Banking Platform', '提供全方位数字银行服务的金融科技公司，包括移动支付、在线贷款、投资理财等服务。'),
            ('HealthCare Plus Medical Systems - Electronic Health Records Division', '医疗信息化解决方案提供商，专注于电子病历系统、医院信息管理系统和远程医疗平台开发。'),
            ('E-Commerce Mega Platform - Asia Pacific Regional Operations', '亚太地区最大的电子商务平台之一，提供 B2B、B2C 和 C2C 多种交易模式。'),
            ('Smart City Infrastructure Solutions - IoT and Sensor Networks', '智慧城市基础设施解决方案提供商，专注于物联网传感器网络、智能交通系统。'),
            ('Educational Technology Consortium - Online Learning Platform', '在线教育技术联盟，提供 K-12 和高等教育在线学习平台。'),
            ('Green Energy Solutions - Renewable Power Management Systems', '可再生能源管理系统提供商，专注于太阳能、风能发电站的监控、调度和优化管理。'),
        ]
        
        ids = []
        for name, desc in orgs:
            cur.execute("""
                INSERT INTO organization (name, description, created_at, deleted_at)
                VALUES (%s, %s, NOW(), NULL)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (name, desc))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
                
        print(f"  ✓ 创建了 {len(ids)} 个组织\n")
        return ids


    def create_targets(self, org_ids: list) -> list:
        """创建扫描目标"""
        print("🎯 创建扫描目标...")
        cur = self.conn.cursor()
        
        domains = [
            'api.acme-corporation-international-holdings.com',
            'portal.techstart-innovation-labs-research.io',
            'secure.global-financial-services-digital-banking.com',
            'ehr.healthcare-plus-medical-systems-platform.org',
            'shop.ecommerce-mega-platform-asia-pacific.com',
            'dashboard.smart-city-infrastructure-iot-sensors.net',
            'learn.educational-technology-consortium-online.edu',
            'monitor.green-energy-solutions-renewable-power.com',
            'admin.enterprise-resource-planning-system-v2.internal.corp',
            'staging.customer-relationship-management-platform.dev',
            'beta.supply-chain-management-logistics-tracking.io',
            'test.human-resources-information-system-portal.local',
            'dev.content-management-system-headless-api.example.com',
            'qa.business-intelligence-analytics-dashboard.staging',
            'uat.project-management-collaboration-tools.preview',
        ]
        
        ips = ['203.0.113.50', '198.51.100.100', '192.0.2.200', '203.0.113.150', '198.51.100.250']
        cidrs = ['10.0.0.0/24', '172.16.0.0/16', '192.168.100.0/24']
        
        ids = []
        
        # 域名目标
        for i, domain in enumerate(domains):
            cur.execute("""
                INSERT INTO target (name, type, created_at, last_scanned_at, deleted_at)
                VALUES (%s, 'domain', NOW(), NOW() - INTERVAL '%s days', NULL)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (domain, random.randint(0, 30)))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
                # 关联到组织
                if org_ids:
                    org_id = org_ids[i % len(org_ids)]
                    cur.execute("""
                        INSERT INTO organization_targets (organization_id, target_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, (org_id, row[0]))
        
        # IP 目标
        for ip in ips:
            cur.execute("""
                INSERT INTO target (name, type, created_at, last_scanned_at, deleted_at)
                VALUES (%s, 'ip', NOW(), NOW() - INTERVAL '%s days', NULL)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (ip, random.randint(0, 30)))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
        
        # CIDR 目标
        for cidr in cidrs:
            cur.execute("""
                INSERT INTO target (name, type, created_at, last_scanned_at, deleted_at)
                VALUES (%s, 'cidr', NOW(), NOW() - INTERVAL '%s days', NULL)
                ON CONFLICT DO NOTHING
                RETURNING id
            """, (cidr, random.randint(0, 30)))
            row = cur.fetchone()
            if row:
                ids.append(row[0])
                
        print(f"  ✓ 创建了 {len(ids)} 个扫描目标\n")
        return ids

    def create_scans(self, target_ids: list, engine_ids: list, worker_ids: list) -> list:
        """创建扫描任务"""
        print("🔍 创建扫描任务...")
        cur = self.conn.cursor()
        
        if not target_ids or not engine_ids:
            print("  ⚠ 缺少目标或引擎，跳过\n")
            return []
        
        statuses = ['cancelled', 'completed', 'failed', 'initiated', 'running']
        stages = ['subdomain_discovery', 'port_scanning', 'web_discovery', 'vulnerability_scanning']
        
        ids = []
        for target_id in target_ids[:10]:
            for _ in range(random.randint(2, 5)):
                status = random.choice(statuses)
                engine_id = random.choice(engine_ids)
                worker_id = random.choice(worker_ids) if worker_ids else None
                
                progress = random.randint(0, 100) if status == 'running' else (100 if status == 'completed' else 0)
                stage = random.choice(stages) if status == 'running' else ''
                error_msg = 'Connection timeout while scanning target. Please check network connectivity.' if status == 'failed' else ''
                
                cur.execute("""
                    INSERT INTO scan (
                        target_id, engine_id, status, worker_id, progress, current_stage,
                        results_dir, error_message, container_ids, stage_progress,
                        cached_subdomains_count, cached_websites_count, cached_endpoints_count,
                        cached_ips_count, cached_directories_count, cached_vulns_total,
                        cached_vulns_critical, cached_vulns_high, cached_vulns_medium, cached_vulns_low,
                        created_at, stopped_at, deleted_at
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        NOW() - INTERVAL '%s days', %s, NULL
                    )
                    RETURNING id
                """, (
                    target_id, engine_id, status, worker_id, progress, stage,
                    f'/app/results/scan_{target_id}', error_msg, '{}', '{}',
                    random.randint(10, 500), random.randint(5, 100), random.randint(50, 1000),
                    random.randint(5, 50), random.randint(100, 2000), random.randint(0, 50),
                    random.randint(0, 5), random.randint(0, 10), random.randint(0, 15), random.randint(0, 20),
                    random.randint(0, 60),
                    datetime.now() if status == 'completed' else None
                ))
                row = cur.fetchone()
                if row:
                    ids.append(row[0])
                    
        print(f"  ✓ 创建了 {len(ids)} 个扫描任务\n")
        return ids

    def create_scheduled_scans(self, org_ids: list, target_ids: list, engine_ids: list):
        """创建定时扫描任务"""
        print("⏰ 创建定时扫描任务...")
        cur = self.conn.cursor()
        
        if not engine_ids:
            print("  ⚠ 缺少引擎，跳过\n")
            return
        
        schedules = [
            ('Daily-Full-Security-Assessment-Scan-For-Production-Environment-Critical-Assets', '0 2 * * *', True),
            ('Weekly-Comprehensive-Vulnerability-Scan-For-All-External-Facing-Services', '0 3 * * 0', True),
            ('Monthly-Deep-Penetration-Testing-Scan-For-Internal-Network-Infrastructure', '0 4 1 * *', True),
            ('Hourly-Quick-Reconnaissance-Scan-For-New-Asset-Discovery-And-Monitoring', '0 * * * *', False),
            ('Bi-Weekly-Compliance-Check-Scan-For-PCI-DSS-And-SOC2-Requirements', '0 5 1,15 * *', True),
            ('Quarterly-Full-Infrastructure-Security-Audit-Scan-With-Extended-Templates', '0 6 1 1,4,7,10 *', True),
            ('Daily-API-Endpoint-Security-Scan-For-REST-And-GraphQL-Services', '30 1 * * *', True),
            ('Weekly-Web-Application-Vulnerability-Scan-For-Customer-Facing-Portals', '0 4 * * 1', False),
        ]
        
        count = 0
        for name, cron, enabled in schedules:
            engine_id = random.choice(engine_ids)
            org_id = random.choice(org_ids) if org_ids and random.choice([True, False]) else None
            target_id = random.choice(target_ids) if target_ids and not org_id else None
            
            cur.execute("""
                INSERT INTO scheduled_scan (
                    name, engine_id, organization_id, target_id, cron_expression, is_enabled,
                    run_count, last_run_time, next_run_time, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                ON CONFLICT DO NOTHING
            """, (
                name, engine_id, org_id, target_id, cron, enabled,
                random.randint(0, 100),
                datetime.now() - timedelta(days=random.randint(0, 7)) if random.choice([True, False]) else None,
                datetime.now() + timedelta(hours=random.randint(1, 168))
            ))
            count += 1
            
        print(f"  ✓ 创建了 {count} 个定时扫描任务\n")


    def create_subdomains(self, target_ids: list):
        """创建子域名"""
        print("🌐 创建子域名...")
        cur = self.conn.cursor()
        
        prefixes = [
            'api', 'admin', 'portal', 'dashboard', 'app', 'mobile', 'staging', 'dev',
            'test', 'qa', 'uat', 'beta', 'alpha', 'demo', 'sandbox', 'internal',
            'secure', 'auth', 'login', 'sso', 'oauth', 'identity', 'accounts',
            'mail', 'smtp', 'imap', 'webmail', 'ftp', 'sftp', 'files', 'storage',
            'cdn', 'static', 'assets', 'media', 'db', 'database', 'mysql', 'postgres',
            'redis', 'mongo', 'elastic', 'vpn', 'remote', 'gateway', 'proxy',
            'monitoring', 'metrics', 'grafana', 'prometheus', 'kibana', 'logs',
            'jenkins', 'ci', 'cd', 'gitlab', 'jira', 'confluence', 'kubernetes', 'k8s',
        ]
        
        # 获取域名目标
        cur.execute("SELECT id, name FROM target WHERE type = 'domain' AND deleted_at IS NULL LIMIT 8")
        domain_targets = cur.fetchall()
        
        count = 0
        for target_id, target_name in domain_targets:
            num = random.randint(20, 40)
            selected = random.sample(prefixes, min(num, len(prefixes)))
            
            for prefix in selected:
                subdomain_name = f'{prefix}.{target_name}'
                cur.execute("""
                    INSERT INTO subdomain (name, target_id, discovered_at, deleted_at)
                    VALUES (%s, %s, NOW(), NULL)
                    ON CONFLICT DO NOTHING
                """, (subdomain_name, target_id))
                count += 1
                
        print(f"  ✓ 创建了 {count} 个子域名\n")

    def create_websites(self, target_ids: list) -> list:
        """创建网站"""
        print("🌍 创建网站...")
        cur = self.conn.cursor()
        
        titles = [
            'Enterprise Resource Planning System - Dashboard | Acme Corporation Internal Portal',
            'Customer Relationship Management Platform - Login | Secure Access Required',
            'Human Resources Information System - Employee Self Service Portal v3.2.1',
            'Supply Chain Management - Logistics Tracking Dashboard | Real-time Updates',
            'Business Intelligence Analytics - Executive Summary Report Generator',
            'Content Management System - Admin Panel | Headless CMS API Gateway',
            'Project Management Collaboration Tools - Team Workspace | Agile Board',
            'E-Commerce Platform - Product Catalog Management | Inventory Control',
        ]
        
        webservers = ['nginx/1.24.0', 'Apache/2.4.57', 'Microsoft-IIS/10.0', 'cloudflare', 'gunicorn/21.2.0']
        tech_stacks = [
            ['React', 'Node.js', 'Express', 'MongoDB'],
            ['Vue.js', 'Django', 'PostgreSQL', 'Celery'],
            ['Angular', 'Spring Boot', 'MySQL'],
            ['Next.js', 'FastAPI', 'Redis'],
        ]
        
        # 获取域名目标
        cur.execute("SELECT id, name FROM target WHERE type = 'domain' AND deleted_at IS NULL LIMIT 10")
        domain_targets = cur.fetchall()
        
        ids = []
        for target_id, target_name in domain_targets:
            for i in range(random.randint(3, 6)):
                protocol = random.choice(['https', 'http'])
                port = random.choice([80, 443, 8080, 8443, 3000])
                
                if port in [80, 443]:
                    url = f'{protocol}://{target_name}/'
                else:
                    url = f'{protocol}://{target_name}:{port}/'
                
                if i > 0:
                    path = random.choice(['admin/', 'api/', 'portal/', 'dashboard/'])
                    url = f'{protocol}://{target_name}:{port}/{path}'
                
                cur.execute("""
                    INSERT INTO website (
                        url, target_id, host, title, webserver, tech, status_code,
                        content_length, content_type, location, body_preview, vhost,
                        discovered_at, deleted_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NULL)
                    ON CONFLICT DO NOTHING
                    RETURNING id
                """, (
                    url, target_id, target_name, random.choice(titles),
                    random.choice(webservers), random.choice(tech_stacks),
                    random.choice([200, 301, 302, 403, 404]),
                    random.randint(1000, 500000), 'text/html; charset=utf-8',
                    f'https://{target_name}/login' if random.choice([True, False]) else '',
                    'Welcome to our enterprise platform. This system provides comprehensive tools for managing your business operations.',
                    random.choice([True, False, None])
                ))
                row = cur.fetchone()
                if row:
                    ids.append(row[0])
                    
        print(f"  ✓ 创建了 {len(ids)} 个网站\n")
        return ids

    def create_endpoints(self, target_ids: list):
        """创建端点"""
        print("🔗 创建端点...")
        cur = self.conn.cursor()
        
        paths = [
            '/api/v1/users/authentication/login', '/api/v1/users/authentication/logout',
            '/api/v1/users/profile/settings/preferences', '/api/v2/products/catalog/categories/list',
            '/api/v2/orders/checkout/payment-processing', '/api/v3/analytics/dashboard/metrics/summary',
            '/graphql/query', '/graphql/mutation', '/admin/dashboard/overview',
            '/admin/users/management/list', '/admin/settings/configuration/system',
            '/portal/customer/account/billing-history', '/internal/health/readiness-check',
            '/internal/metrics/prometheus-endpoint', '/webhook/payment/stripe/callback',
            '/oauth/authorize', '/oauth/token', '/swagger/v1/swagger.json', '/openapi/v3/api-docs',
        ]
        
        gf_patterns = [['debug', 'config'], ['api', 'json'], ['upload', 'file'], ['admin'], ['auth'], []]
        
        # 获取域名目标
        cur.execute("SELECT id, name FROM target WHERE type = 'domain' AND deleted_at IS NULL LIMIT 8")
        domain_targets = cur.fetchall()
        
        count = 0
        for target_id, target_name in domain_targets:
            num = random.randint(15, 25)
            selected = random.sample(paths, min(num, len(paths)))
            
            for path in selected:
                protocol = random.choice(['https', 'http'])
                port = random.choice([443, 8443, 3000, 8080])
                url = f'{protocol}://{target_name}:{port}{path}' if port != 443 else f'{protocol}://{target_name}{path}'
                
                cur.execute("""
                    INSERT INTO endpoint (
                        url, target_id, host, title, webserver, status_code, content_length,
                        content_type, tech, location, body_preview, vhost, matched_gf_patterns,
                        discovered_at, deleted_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NULL)
                    ON CONFLICT DO NOTHING
                """, (
                    url, target_id, target_name, 'API Documentation - Swagger UI',
                    random.choice(['nginx/1.24.0', 'gunicorn/21.2.0']),
                    random.choice([200, 201, 301, 400, 401, 403, 404, 500]),
                    random.randint(100, 50000), 'application/json',
                    random.choice([['Node.js', 'Express'], ['Python', 'FastAPI'], ['Go', 'Gin']]),
                    '', '{"status":"success","message":"Request processed successfully"}',
                    random.choice([True, False, None]), random.choice(gf_patterns)
                ))
                count += 1
                
        print(f"  ✓ 创建了 {count} 个端点\n")


    def create_directories(self, target_ids: list, website_ids: list):
        """创建目录"""
        print("📁 创建目录...")
        cur = self.conn.cursor()
        
        if not website_ids:
            print("  ⚠ 没有网站，跳过\n")
            return
        
        dir_paths = [
            '/admin/', '/administrator/', '/wp-admin/', '/wp-content/', '/backup/', '/backups/',
            '/old/', '/archive/', '/temp/', '/test/', '/dev/', '/staging/', '/config/',
            '/api/', '/api/v1/', '/api/v2/', '/uploads/', '/files/', '/documents/', '/docs/',
            '/images/', '/assets/', '/static/', '/css/', '/js/', '/logs/', '/debug/',
            '/private/', '/secure/', '/internal/', '/data/', '/database/', '/phpmyadmin/',
            '/cgi-bin/', '/includes/', '/lib/', '/vendor/', '/node_modules/', '/plugins/',
            '/themes/', '/templates/', '/src/', '/app/', '/portal/', '/dashboard/', '/panel/',
            '/user/', '/users/', '/account/', '/profile/', '/member/', '/customer/',
        ]
        
        content_types = ['text/html; charset=utf-8', 'application/json', 'text/plain', 'text/css']
        
        # 获取网站信息
        cur.execute("SELECT id, url, target_id FROM website WHERE deleted_at IS NULL LIMIT 15")
        websites = cur.fetchall()
        
        count = 0
        for website_id, website_url, target_id in websites:
            num = random.randint(20, 35)
            selected = random.sample(dir_paths, min(num, len(dir_paths)))
            
            for path in selected:
                url = website_url.rstrip('/') + path
                
                cur.execute("""
                    INSERT INTO directory (
                        url, website_id, target_id, status, content_length, words, lines,
                        content_type, duration, discovered_at, deleted_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NULL)
                    ON CONFLICT DO NOTHING
                """, (
                    url, website_id, target_id,
                    random.choice([200, 301, 302, 403, 404, 500]),
                    random.randint(0, 100000), random.randint(0, 5000), random.randint(0, 500),
                    random.choice(content_types), random.randint(10000000, 5000000000)
                ))
                count += 1
                
        print(f"  ✓ 创建了 {count} 个目录\n")

    def create_host_port_mappings(self, target_ids: list):
        """创建主机端口映射"""
        print("🔌 创建主机端口映射...")
        cur = self.conn.cursor()
        
        ports = [21, 22, 25, 53, 80, 110, 143, 443, 445, 993, 1433, 3306, 3389, 5432, 6379, 8080, 8443, 9200, 27017]
        
        # 获取域名目标
        cur.execute("SELECT id, name FROM target WHERE type = 'domain' AND deleted_at IS NULL LIMIT 8")
        domain_targets = cur.fetchall()
        
        count = 0
        for target_id, target_name in domain_targets:
            num_ips = random.randint(3, 6)
            
            for _ in range(num_ips):
                ip = f'192.168.{random.randint(1, 254)}.{random.randint(1, 254)}'
                num_ports = random.randint(3, 8)
                selected_ports = random.sample(ports, min(num_ports, len(ports)))
                
                for port in selected_ports:
                    cur.execute("""
                        INSERT INTO host_port_mapping (target_id, host, ip, port, discovered_at, deleted_at)
                        VALUES (%s, %s, %s, %s, NOW(), NULL)
                        ON CONFLICT DO NOTHING
                    """, (target_id, target_name, ip, port))
                    count += 1
                    
        print(f"  ✓ 创建了 {count} 个主机端口映射\n")

    def create_vulnerabilities(self, target_ids: list):
        """创建漏洞"""
        print("🐛 创建漏洞...")
        cur = self.conn.cursor()
        
        vuln_types = [
            'sql-injection', 'cross-site-scripting-xss', 'cross-site-request-forgery-csrf',
            'server-side-request-forgery-ssrf', 'xml-external-entity-xxe', 'remote-code-execution-rce',
            'local-file-inclusion-lfi', 'directory-traversal', 'authentication-bypass',
            'insecure-direct-object-reference-idor', 'sensitive-data-exposure', 'security-misconfiguration',
            'broken-access-control', 'cors-misconfiguration', 'subdomain-takeover',
            'exposed-admin-panel', 'default-credentials', 'information-disclosure',
        ]
        
        sources = ['nuclei', 'dalfox', 'sqlmap', 'crlfuzz', 'httpx', 'manual-testing']
        severities = ['unknown', 'info', 'low', 'medium', 'high', 'critical']
        
        descriptions = [
            'A SQL injection vulnerability was discovered in the login form. An attacker can inject malicious SQL queries through the username parameter.',
            'A reflected cross-site scripting (XSS) vulnerability was found in the search functionality. User input is not properly sanitized.',
            'Server-Side Request Forgery (SSRF) vulnerability detected in the URL preview feature. An attacker can manipulate the server to make requests to internal services.',
            'Remote Code Execution (RCE) vulnerability found in the file upload functionality. Insufficient validation of uploaded files allows attackers to upload malicious scripts.',
            'Authentication bypass vulnerability discovered in the password reset mechanism. Attackers can reset any users password without proper verification.',
            'Insecure Direct Object Reference (IDOR) vulnerability found in the user profile API. By manipulating the user ID parameter, attackers can access other users data.',
            'CORS misconfiguration detected - The Access-Control-Allow-Origin header is set to wildcard (*) with credentials allowed.',
            'Information disclosure through verbose error messages - Application errors reveal sensitive information about the technology stack.',
        ]
        
        paths = ['/api/v1/users/login', '/api/v2/search', '/admin/dashboard', '/portal/upload', '/graphql', '/oauth/authorize']
        
        # 获取域名目标
        cur.execute("SELECT id, name FROM target WHERE type = 'domain' AND deleted_at IS NULL LIMIT 10")
        domain_targets = cur.fetchall()
        
        count = 0
        for target_id, target_name in domain_targets:
            num = random.randint(5, 15)
            
            for _ in range(num):
                severity = random.choice(severities)
                cvss_ranges = {
                    'critical': (9.0, 10.0), 'high': (7.0, 8.9), 'medium': (4.0, 6.9),
                    'low': (0.1, 3.9), 'info': (0.0, 0.0), 'unknown': (0.0, 10.0)
                }
                cvss_range = cvss_ranges.get(severity, (0.0, 10.0))
                cvss_score = round(random.uniform(*cvss_range), 1)
                
                path = random.choice(paths)
                url = f'https://{target_name}{path}?param=test&id={random.randint(1, 1000)}'
                
                raw_output = json.dumps({
                    'template': f'CVE-2024-{random.randint(10000, 99999)}',
                    'matcher_name': 'default',
                    'severity': severity,
                    'host': target_name,
                    'matched_at': url,
                })
                
                cur.execute("""
                    INSERT INTO vulnerability (
                        target_id, url, vuln_type, severity, source, cvss_score,
                        description, raw_output, discovered_at, deleted_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NULL)
                """, (
                    target_id, url, random.choice(vuln_types), severity,
                    random.choice(sources), cvss_score, random.choice(descriptions), raw_output
                ))
                count += 1
                
        print(f"  ✓ 创建了 {count} 个漏洞\n")


def main():
    parser = argparse.ArgumentParser(description="直接通过 SQL 生成测试数据")
    parser.add_argument('--clear', action='store_true', help='清除现有数据后重新生成')
    args = parser.parse_args()
    
    generator = TestDataGenerator(clear=args.clear)
    generator.run()


if __name__ == "__main__":
    main()
