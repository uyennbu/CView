"""Tests for Job Search API and search_history recording (GET /api/v1/jobs/search)."""
import uuid
import pytest
from sqlalchemy import func, select

from app.core.security import create_access_token
from app.models.business import CandidateProfile, Domain, JobPost, SearchHistory
from app.models.system import Account


@pytest.fixture
def candidate_auth(db_session):
    """Fixture tạo hoặc lấy tài khoản candidate01 kèm hồ sơ ứng viên và Bearer token."""
    account = db_session.scalar(select(Account).where(Account.username == "candidate01"))
    if not account:
        account = Account(
            username="candidate01",
            email="candidate01@gmail.com",
            password_hash="test_hash",
            status="ACTIVE",
        )
        db_session.add(account)
        db_session.flush()

    profile = db_session.scalar(
        select(CandidateProfile).where(CandidateProfile.account_id == account.account_id)
    )
    if not profile:
        profile = CandidateProfile(
            account_id=account.account_id,
            full_name="Nguyễn Văn Ứng Viên",
            years_of_experience=2.0,
            education_level="BACHELOR",
        )
        db_session.add(profile)
        db_session.flush()

    token = create_access_token(
        subject=str(account.account_id),
        roles=["CANDIDATE"],
    )
    return {"Authorization": f"Bearer {token}"}, profile


def test_search_jobs_guest_no_filter(client, db_session):
    """Khách vãng lai tìm kiếm không kèm bộ lọc: Trả về danh sách việc làm đã duyệt, không ghi search_history."""
    history_count_before = db_session.scalar(select(func.count(SearchHistory.search_id))) or 0

    res = client.get("/api/v1/jobs/search")
    assert res.status_code == 200

    data = res.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    assert data["page"] == 1
    assert data["limit"] == 20
    # Tất cả các việc làm trả về đều phải là APPROVED
    for item in data["items"]:
        assert item["approval_status"] == "APPROVED"
        assert "job_id" in item

    # Không tăng số lượng bản ghi search_history vì là khách chưa đăng nhập
    history_count_after = db_session.scalar(select(func.count(SearchHistory.search_id))) or 0
    assert history_count_after == history_count_before


def test_search_jobs_by_keyword(client):
    """Tìm kiếm theo từ khóa 'Python': Trả về công việc liên quan đến Python."""
    res = client.get("/api/v1/jobs/search?keyword=Python")
    assert res.status_code == 200

    data = res.json()
    assert data["keyword"] == "Python"
    assert data["total"] >= 1
    # Ít nhất 1 bài có chứa Python trong tiêu đề hoặc vị trí
    matched_titles = [item["title"] for item in data["items"] if "Python" in item["title"]]
    assert len(matched_titles) >= 1


def test_search_jobs_by_city(client):
    """Tìm kiếm theo thành phố 'Ha Noi': Chỉ trả về các công việc tại Hà Nội."""
    res = client.get("/api/v1/jobs/search?city=Ha Noi")
    assert res.status_code == 200

    data = res.json()
    assert data["city"] == "Ha Noi"
    assert data["total"] >= 1
    for item in data["items"]:
        if item["address"]:
            assert "Ha Noi" in item["address"]["city"] or "Hà Nội" in item["address"]["city"]


def test_search_jobs_by_domain(client, db_session):
    """Tìm kiếm theo lĩnh vực domain_id."""
    domain = db_session.scalars(select(Domain)).first()
    assert domain is not None

    res = client.get(f"/api/v1/jobs/search?domain_id={domain.domain_id}")
    assert res.status_code == 200

    data = res.json()
    assert data["domain_id"] == domain.domain_id
    for item in data["items"]:
        domain_ids = [d["domain_id"] for d in item["domains"]]
        assert domain.domain_id in domain_ids


def test_search_jobs_by_job_type_and_workplace(client):
    """Tìm kiếm kết hợp theo hình thức làm việc và môi trường làm việc."""
    res = client.get("/api/v1/jobs/search?job_type=FULL_TIME&workplace_type=HYBRID")
    assert res.status_code == 200

    data = res.json()
    assert data["job_type"] == "FULL_TIME"
    assert data["workplace_type"] == "HYBRID"
    for item in data["items"]:
        assert item["job_type"] == "FULL_TIME"
        assert item["workplace_type"] == "HYBRID"


def test_search_jobs_by_salary_min(client):
    """Tìm kiếm theo mức lương tối thiểu (salary_min)."""
    min_sal = 30000000
    res = client.get(f"/api/v1/jobs/search?salary_min={min_sal}")
    assert res.status_code == 200

    data = res.json()
    assert data["salary_min"] == min_sal
    for item in data["items"]:
        # Công việc phải có salary_max >= 30tr hoặc salary_min >= 30tr hoặc thỏa thuận
        is_negotiable = item["is_salary_negotiable"]
        sal_max = item["salary_max"] or 0
        sal_min = item["salary_min"] or 0
        assert is_negotiable or sal_max >= min_sal or sal_min >= min_sal


def test_search_jobs_does_not_return_pending_or_rejected(client, db_session):
    """Đảm bảo tin tuyển dụng PENDING hoặc REJECTED không xuất hiện trong kết quả tìm việc."""
    res = client.get("/api/v1/jobs/search")
    assert res.status_code == 200

    data = res.json()
    returned_job_ids = [item["job_id"] for item in data["items"]]

    # Lấy danh sách ID các bài chưa duyệt trong DB
    pending_ids = [str(jid) for jid in db_session.scalars(
        select(JobPost.job_post_id).where(JobPost.approval_status != "APPROVED")
    ).all()]

    for pid in pending_ids:
        assert pid not in returned_job_ids


def test_search_jobs_candidate_auto_records_search_history(client, candidate_auth, db_session):
    """Ứng viên đăng nhập tìm kiếm việc làm: Hệ thống tự động ghi vết vào bảng search_history."""
    headers, candidate = candidate_auth
    keyword = f"Backend_{uuid.uuid4().hex[:6]}"
    city = "Ha Noi"
    min_salary = 20000000

    res = client.get(
        f"/api/v1/jobs/search?keyword={keyword}&city={city}&salary_min={min_salary}",
        headers=headers,
    )
    assert res.status_code == 200

    # Kiểm tra bản ghi trong bảng search_history
    history = db_session.scalar(
        select(SearchHistory)
        .where(
            SearchHistory.candidate_id == candidate.candidate_id,
            SearchHistory.keyword == keyword,
        )
        .order_by(SearchHistory.search_id.desc())
    )
    assert history is not None
    assert history.city == city
    assert history.min_salary == min_salary
    assert history.results_count == res.json()["total"]
    assert history.created_at is not None


def test_search_jobs_pagination(client):
    """Kiểm tra phân trang page và limit."""
    res_p1 = client.get("/api/v1/jobs/search?page=1&limit=2")
    assert res_p1.status_code == 200
    data_p1 = res_p1.json()
    assert data_p1["page"] == 1
    assert data_p1["limit"] == 2
    assert len(data_p1["items"]) <= 2

    if data_p1["total"] > 2:
        res_p2 = client.get("/api/v1/jobs/search?page=2&limit=2")
        assert res_p2.status_code == 200
        data_p2 = res_p2.json()
        assert data_p2["page"] == 2
        # Danh sách bài trang 2 không trùng với trang 1
        p1_ids = {item["job_id"] for item in data_p1["items"]}
        p2_ids = {item["job_id"] for item in data_p2["items"]}
        assert p1_ids.isdisjoint(p2_ids)


def test_search_jobs_invalid_filters_validation(client):
    """Kiểm tra validation khi truyền tham số bộ lọc không đúng định dạng."""
    # job_type không hợp lệ
    res_type = client.get("/api/v1/jobs/search?job_type=INVALID_TYPE")
    assert res_type.status_code == 422

    # workplace_type không hợp lệ
    res_wp = client.get("/api/v1/jobs/search?workplace_type=ON_MARS")
    assert res_wp.status_code == 422

    # salary_min âm
    res_sal = client.get("/api/v1/jobs/search?salary_min=-500")
    assert res_sal.status_code == 422
