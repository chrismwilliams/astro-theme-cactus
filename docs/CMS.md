# CMS (`/admin`)

CMS nhỏ chạy trên chính Worker của blog: viết và sửa bài markdown, chấm điểm SEO khi gõ, phân tích bài bằng Claude (qua Cloudflare AI Gateway). Mỗi lần lưu là một commit vào GitHub, sau đó Cloudflare tự build lại site.

## Kiến trúc

| Phần | Nằm ở đâu |
|---|---|
| Giao diện | `src/pages/admin/*`, `src/layouts/Admin.astro`, `src/styles/admin.css` |
| Chấm điểm SEO (chạy trên trình duyệt) | `src/lib/seo.ts` |
| API `/api/admin/*` | `functions/admin/*` (router, auth, settings, github, ai, google) |
| Lưu trữ | Workers KV `BLOG_KV` (cấu hình, credential đã mã hoá, cache), GitHub (bài viết) |

### Bảo mật

- Đăng nhập bằng **Cloudflare Access**. Ngoài lớp chặn của Access ở edge, Worker còn xác minh lại JWT của Access ở **mọi** request `/api/admin/*`: kiểm tra chữ ký RS256, `aud`, `iss`, `exp` và danh sách email nếu có. Thiếu cấu hình thì từ chối tất cả.
- Request ghi (PUT/POST/DELETE) phải cùng origin và có header `X-CMS-Request`, để chống CSRF.
- Credential nhập trong trang Cài đặt được mã hoá **AES-256-GCM** bằng khoá dẫn xuất từ secret `CMS_MASTER_KEY`, rồi mới lưu vào KV. API không bao giờ trả lại giá trị, chỉ trả trạng thái "đã lưu …1234".
- Chỉ ghi được vào `content/posts|notes/**/*.md(x)` và `public/images/uploads/*`. Các đường dẫn khác bị từ chối.

## Thiết lập lần đầu (khoảng 10 phút)

1. **Deploy:** merge PR. Cloudflare tự tạo KV namespace `BLOG_KV` khi deploy (wrangler ≥ 4.x được ghim trong `devDependencies`).
2. **Cloudflare Access:** Zero Trust → Access → Applications → Add → Self-hosted:
   - **Một** application với 2 destination: `blog.datnt.work/admin` và `blog.datnt.work/api/admin`. Phải là cùng một application, vì Worker chỉ chấp nhận một AUD tag.
   - Policy: Allow, Include → Emails → email của bạn.
   - Sau khi tạo, copy **Application Audience (AUD) Tag**.
3. **Biến của Worker:** Workers & Pages → `blog` → Settings → Variables and Secrets:
   - `ACCESS_TEAM_DOMAIN` = `<team>.cloudflareaccess.com` (xem ở Zero Trust → Settings → Custom pages)
   - `ACCESS_AUD` = AUD tag ở bước 2
   - `ADMIN_EMAILS` = email của bạn (không bắt buộc, thêm một lớp kiểm tra)
   - `CMS_MASTER_KEY` (loại **Secret**) = chuỗi ngẫu nhiên ≥ 32 ký tự. Trang Cài đặt có nút tạo sẵn. **Đừng đổi khoá này sau khi đã lưu credential.**

   `wrangler.json` có `keep_vars: true` nên các biến này không bị xoá khi deploy lại.
4. Mở `https://blog.datnt.work/admin/settings/`, đăng nhập qua Access, rồi nhập:
   - **GitHub fine-grained token**: chỉ repo `blog`, quyền *Contents: Read and write*. Bấm "Kiểm tra kết nối".
   - **AI Gateway**: Account ID, Gateway ID (tạo ở Cloudflare → AI → AI Gateway), Anthropic API key (hoặc lưu key trong gateway), gateway token nếu bật Authenticated Gateway. Bấm "Gửi thử 1 request".
   - **Google** (dữ liệu dashboard ở phase 2): dán service account JSON, cấp quyền cho email service account trong GA4 (Viewer) và Search Console, rồi bấm "Tải danh sách từ Google" để chọn property và site.

## Lưu ý khi viết bài

- "Lưu nháp" commit với `draft: true`. Bài nháp không xuất hiện trên site production.
- "Xuất bản" commit với `draft: false`. Site cập nhật sau khoảng 1 phút, khi Cloudflare build xong.
- `keyword` trong frontmatter chỉ dùng cho CMS (điểm SEO), site bỏ qua trường này.
- Bản đang gõ được tự lưu trên trình duyệt. Mở lại trang sẽ có nút khôi phục.
- Component MDX (ví dụ `<Quiz>`) không hiện trong phần xem trước của CMS, chỉ hiện trên site.

## Dashboard (phase 2)

| Trang | Nguồn | Nội dung |
|---|---|---|
| Tổng quan | GA4, GSC, PageSpeed, URL Inspection, nội dung repo | KPI so với kỳ trước, người dùng/clicks mỗi ngày, tốc độ tải trang chủ, trạng thái index, AI gợi ý tuần này, sức khoẻ SEO, hiệu suất từng bài, bảng chất lượng nội dung, lỗi SEO phổ biến, nhịp xuất bản, top truy vấn, CTR thấp, từ khoá vị trí 8–20, nguồn truy cập, thiết bị, quốc gia |
| Traffic | GA4 | người online, người dùng/phiên/lượt xem/thời gian đọc, trang xem nhiều + tỉ lệ đọc hết (sự kiện `read_complete`), nguồn, thiết bị, quốc gia |
| Search & thứ hạng | Search Console | clicks/impressions/CTR/vị trí, theo dõi thứ hạng 90 ngày, bảng truy vấn có lọc, trang CTR thấp, cannibalization, trạng thái index |
| Core Web Vitals | PageSpeed Insights + CrUX | điểm Lighthouse, LCP/INP/CLS của người dùng thật, đo từng bài |
| YouTube | YouTube Data API | subscribers, lượt xem, video mới nhất |

- Mọi số liệu được cache trong KV: GA4 1 giờ, GSC 3 giờ, thứ hạng 6 giờ, PageSpeed và index 24 giờ. Nút "Làm mới" bỏ qua cache.
- Search Console trễ khoảng 3 ngày, nên khoảng thời gian kết thúc ở 3 ngày trước.
- "Thứ hạng" là vị trí trung bình theo ngày lấy từ Search Console (lưu 16 tháng), không cần cron.
- Cấu hình nằm trong Cài đặt → Google: service account (quyền Viewer GA4, Restricted Search Console), property GA4, site GSC, PageSpeed API key (không bắt buộc, giúp tránh giới hạn), YouTube Data API key.
