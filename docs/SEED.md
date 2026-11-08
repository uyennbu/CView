1. Từ file 02_seed_data.py, ta thêm đoạn code sau để xuất ra file 02_seed_data.sql:

        def export_to_sql_file(filename="database/02_seed_data.sql"):
            seed_data = generate_seed_data()
            table_order = [
                "accounts", "roles", "permissions", "account_roles", "role_permissions",
                "addresses", "companies", "recruiter_profiles", "candidate_profiles",
                "domains", "skills", "certificates", "resumes", "resume_skills",
                "job_posts", "job_skills", "job_certificates", "job_domains",
                "cv_analyses", "matched_results", "saved_jobs", "job_applications",
                "search_history", "job_notifications", "other_notifications",
                "sessions", "auth_logs", "activity_logs", "system_error_logs"
            ]
            
            with open(filename, "w", encoding="utf-8") as f:
                f.write("-- CView Database Seed Data Dump\n\n")
                for table in table_order:
                    records = seed_data.get(table, [])
                    if not records:
                        continue
                    for r in records:
                        cols = ", ".join(r.keys())
                        vals = []
                        for v in r.values():
                            if v is None:
                                vals.append("NULL")
                            elif isinstance(v, (int, float)):
                                vals.append(str(v))
                            elif isinstance(v, bool):
                                vals.append("TRUE" if v else "FALSE")
                            else:
                                escaped = str(v).replace("'", "''")
                                vals.append(f"'{escaped}'")
                        vals_str = ", ".join(vals)
                        f.write(f"INSERT INTO {table} ({cols}) VALUES ({vals_str});\n")
                    f.write("\n")
            print(f"Đã xuất dữ liệu ra file thành công: {filename}")

2. Sau đó chạy file bằng lệnh: 
`python 02_seed_data_demo.py`
dữ liệu sẽ được lưu vào 02_seed_data.sql, chạy file sql này pg4admin để có được database hoàn chỉnh
