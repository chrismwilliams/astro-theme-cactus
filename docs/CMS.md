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

## Phase 2

Dashboard GA4 (traffic, nguồn, thiết bị, sự kiện `read_depth` đã được gửi từ blog), Search Console (clicks, impressions, CTR, vị trí theo từ khoá, trang chưa index), PageSpeed/CrUX (Core Web Vitals), YouTube, và tác vụ hằng ngày lưu lại số liệu để vẽ biểu đồ thứ hạng dài hạn.
