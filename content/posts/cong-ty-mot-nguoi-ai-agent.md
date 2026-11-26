---
title: "Công ty một người với AI agent: 7 bài học tuần đầu"
description: "Vận hành công ty một người bằng 5 AI agent trên Orca: cách chia việc, quy trình code Opus–Sonnet, giảm token, dựng VM macOS để test và những sự cố có thật."
publishDate: 2026-11-26
tags: [cong-ty-mot-nguoi, ai-agent, claude, orca, multi-agent, devsecops]
draft: false
---

Mình là Security Engineer, mảng AppSec. Ngoài giờ mình ôm cùng lúc vài dự án ở những mảng rất khác nhau: công cụ bảo mật, ứng dụng desktop, sản phẩm tài chính cá nhân, website nội dung và một kênh video. Mình biết một người không thể tự làm hết. Nên tuần này mình thử dựng **công ty một người** đúng nghĩa: mỗi mảng giao cho một **AI agent**, còn mình chỉ làm giám đốc, tức là ra quyết định, duyệt và chịu trách nhiệm.

Đọc về "công ty một người thời AI" thì nhiều, nhưng phần lớn là bài khái niệm hoặc quảng cáo công cụ. Bài này khác: đây là nhật ký vận hành thật sau 7 ngày, có con số, có quy trình, và có cả những lần suýt toang.

> [!NOTE]
> Bài này được viết với sự trợ giúp của chính một bot trong hệ thống (richard, "bộ não thứ 2"). Nó gom ghi chép của các bot khác, còn mình duyệt và sửa lại.

## TL;DR: 7 bài học sau tuần đầu

- **Chia bot theo mảng trách nhiệm, không chia theo kỹ năng.** Mỗi bot ôm trọn một dự án.
- **Bot không tự code.** Bot điều phối; việc code giao cho các worker chạy trong git worktree riêng.
- **Đặt model mạnh nhất ở chỗ cần phán đoán khó nhất:** lập plan và lần review đầu.
- **Giới hạn 2 vòng sửa.** Lỗi nhỏ còn sót thì thành issue follow-up.
- **Giảm token bằng cách cắt phần lặp lại** (rebase, báo cáo dài), không cắt chất lượng.
- **Mọi thao tác xoá file hoặc gõ phím phải chạy trong môi trường dùng xong là bỏ**, ví dụ VM.
- **Bot quên.** Cái gì chưa ghi ra file thì coi như chưa xảy ra.

## Công ty một người là gì, và vì sao mình thử

Hiểu đơn giản, công ty một người là mô hình một người sáng lập dùng tự động hoá và AI để làm phần việc trước đây cần cả một nhóm. Chiến lược, quyết định và trách nhiệm cuối cùng vẫn ở người đó. Ở Việt Nam, [Znews cũng đã viết về các kỹ sư dựng AI agent chạy liên tục](https://znews.vn/cong-ty-1-nguoi-dan-thanh-hien-thuc-nho-ai-post1635716.html) để thay một nhóm nhỏ.

Lý do của mình thực tế hơn: các dự án đều chậm vì **mình là nút thắt**. Code, review, SEO, kịch bản video đều chờ mình rảnh. Mình muốn biết nếu chuyển mình từ "người làm" sang "người duyệt" thì thứ gì chạy được, thứ gì vỡ.

## Bộ máy: 5 AI agent, mỗi bot một mảng

Mọi thứ chạy trên Orca, một môi trường quản lý nhiều agent Claude, workspace và worker. Mỗi bot có hai file quan trọng:

- **SOUL.md:** bot là ai, làm gì, xem ở đâu, báo cáo ở đâu, và **không bao giờ được làm gì**.
- **MEMORY.md:** mỗi dòng một sự thật hoặc quyết định của chủ, có ngày.

| Bot | Vai trò | Mảng phụ trách |
|---|---|---|
| javis | Bảo mật & code | công cụ bảo mật, ứng dụng desktop |
| alex | Tư vấn tài chính, sản phẩm fintech | một sản phẩm tài chính cá nhân |
| sanh | Vận hành web, SEO | website nội dung |
| navie | Đạo diễn, biên kịch | kênh video ngắn |
| richard | Bộ não thứ 2 | gom kiến thức của cả nhóm vào wiki Obsidian |

### Bot điều phối, worker làm

Bot không trực tiếp sửa code. Khi có việc, bot khởi động một **worker**: một phiên agent riêng, chạy trong một git worktree riêng, làm xong thì mở PR. Bot chỉ giữ phần điều phối:

- Mỗi việc là một **item** có định nghĩa "thế nào là xong".
- Cần mình quyết thì item chuyển sang **Needs you**, kèm câu hỏi và các lựa chọn.
- Xong thì bot báo, và item đóng lại.

**Bài học 1:** chia bot theo *mảng trách nhiệm* chứ không theo *kỹ năng*. Một bot ôm trọn một dự án sẽ nhớ ngữ cảnh, quyết định cũ và "tính khí" của repo tốt hơn nhiều so với để nhiều bot chuyên môn cùng nhảy vào.

## Quy trình code nhiều agent: Opus lập kế hoạch, Sonnet code

Tuần đầu, mỗi PR chạy theo kiểu: **Opus** lập plan → **Sonnet** code → **Opus** kiểm tra, **vòng nào cũng Opus**. Chất lượng rất tốt. Lần đánh giá bảo mật đầu tiên, bot đã tìm ra một lỗi RCE nghiêm trọng (đã vá) mà mình bỏ sót. Nhưng chi phí cũng khủng khiếp: một item dùng 28 worker, item khác chạm giới hạn 50 liên kết của hệ thống.

Đến ngày thứ hai, mình chốt lại quy trình áp dụng cho mọi bot:

1. **Opus** viết plan chi tiết, gồm cả code và test.
2. **Sonnet** code theo plan.
3. **Opus** kiểm tra độc lập, **chỉ ở lần đầu**. Người kiểm tra không được push hay merge.
4. Các vòng kiểm tra lại sau khi sửa dùng **Sonnet**.
5. **Tối đa 2 vòng sửa.** Lỗi nhỏ còn sót thì ghi thành issue follow-up; lỗi nghiêm trọng thì báo mình.
6. **Mức kiểm tra theo rủi ro.** Chỉ PR về bảo mật hoặc xoá file mới dựng lab và chạy tấn công thử. PR tài liệu, file cấu hình JSON hay giao diện chỉ hiển thị thì đọc diff và chạy test là đủ.
7. Kiểm tra nói "sẵn sàng" **và** CI xanh thì bot tự merge (squash, xoá branch).

> [!TIP]
> Model mạnh nhất nên đặt ở chỗ **cần phán đoán khó nhất**: lập plan và lần review đầu. Kiểm tra lại "đã sửa đúng chỗ bị chỉ ra chưa" là việc hẹp hơn nhiều, model nhanh hơn làm vẫn tốt.

**Bài học 2:** không cần model lớn ở mọi bước. Nhưng bước nào cắt thì phải có lý do, và phải có giới hạn số vòng sửa để không lặp vô tận.

## Giảm token AI agent mà không giảm chất lượng

Vẫn ưu tiên chất lượng, mình cho javis chạy thử 3 điều chỉnh trên **9 PR**, có cả PR rủi ro cao lẫn thấp, rồi tự viết đánh giá.

### 1. Rebase dây chuyền: thủ phạm ít ai để ý

Nhiều PR chạy song song cùng sửa một file "nóng", như file dịch hay registry. PR này merge xong thì PR kia xung đột, lại phải thêm một worker chỉ để rebase. Có PR phải rebase 2 lần.

**Cách sửa:** planner lập **ma trận file và thứ tự merge** ngay từ bước plan, ghi cả các script và tooling dùng chung. PR chạm cùng file thì không chạy song song. File "nóng" thì tạo lại lúc merge, không sửa tay trong từng PR. Kết quả: có PR merge thẳng, không cần rebase lần nào.

### 2. Báo cáo kiểm tra quá dài

Có báo cáo verify dài hơn 100 KB. Vòng sửa sau phải đọc lại nó nên tốn token hai lần. Mình đặt giới hạn: kết luận cộng danh sách lỗi (file:dòng, cách tái hiện, mức độ), khoảng **3–5 KB**, tối đa khoảng 6 KB cho PR rủi ro cao. Bằng chứng để file riêng; spec gửi worker sửa chỉ trỏ tới đường dẫn.

Kết quả: báo cáo còn 5–6 KB, so với 9–11 KB trước đó. Kiểm tra cũng không nông đi: vẫn bắt được một lỗ hổng cách ly sandbox và một chốt bảo vệ bị vô hiệu.

### 3. Test tay nằm trong lần review đầu

Mình không thêm worker QA riêng. Test tay gộp vào lần Opus kiểm tra đầu, và chỉ làm với PR có giao diện. Web dùng trình duyệt điều khiển qua CLI; app macOS chạy trong VM. Lần review đầu tốn thêm khoảng 30 lệnh, nhưng bắt được lỗi mà test tự động bỏ sót. Ví dụ đắt giá nhất: một thư mục trên ổ đĩa chưa mount bị app coi là "hỏng" nên **được phép xoá**.

| Điều chỉnh | Tác động lên token (javis **ước lượng**, chưa đo) |
|---|---|
| Báo cáo ngắn, chỉ đọc plan + diff | giảm khoảng 30–40% ở bước kiểm tra và sửa |
| Ma trận file, thứ tự merge | bớt 1–2 lượt worker rebase mỗi đợt |
| Test tay trong lần review đầu | tăng khoảng 20–30% ở lần review đầu, nhưng tránh được vòng sửa sau khi merge |

**Bài học 3:** muốn giảm token thì đừng cắt chất lượng, hãy cắt **phần lặp lại**: rebase, đọc lại báo cáo dài, quét lại cả repo.

## Test app macOS an toàn: VM thay vì máy thật

Đây là phần mình học được nhiều nhất, theo cách đau nhất.

### Sự cố Cmd-R

Một worker test giao diện bằng cách điều khiển màn hình thật. Nó đã **gửi nhầm Cmd-R vào trình duyệt của mình** đang mở. Không hỏng gì, nhưng đủ để mình cấm hẳn việc bot điều khiển giao diện trên máy thật.

### Vì sao Tart chứ không phải container của Apple

Câu hỏi đầu tiên của mình là: Apple có [container riêng](https://github.com/apple/container) rồi, sao không dùng? Câu trả lời: container của Apple chạy **Linux** bên trong, mà app desktop viết cho Mac cần **macOS** thật. Nên mình chọn [Tart](https://tart.run). Tart dùng cùng Virtualization.framework của Apple nhưng chạy được macOS bên trong.

- Một **ảnh gốc** (macOS + Xcode + công cụ chung) khoảng 88 GB.
- Mỗi lần test, **clone** ra một bản sạch. Clone copy-on-write gần như tức thì, boot tới lúc sẵn sàng khoảng 46 giây. Test xong thì xoá.
- Giấy phép của Apple cho chạy tối đa **2 VM macOS** cùng lúc trên một máy.

### Sự cố thứ hai: script "chỉ cho VM" chạy trên máy thật

Ngay lần đầu, script tạo dữ liệu giả để test tính năng dọn file lại **chạy nhầm trên máy thật**. Nó tạo một app giả trong `/Applications` và ghi đè cấu hình git chung. Bot đã tự dọn, và thêm một chốt trong code: script chỉ chạy được khi phát hiện mình đang ở trong VM.

> [!WARNING]
> Lời dặn "chỉ chạy trong VM" trong spec là **không đủ**. Chốt chặn phải nằm trong code: kiểm tra môi trường, và dừng ngay nếu không đúng.

Thêm một bất ngờ nhỏ: xoá cache ảnh tưởng lấy lại được 87 GB, nhưng thực tế chỉ được khoảng 1 GB. Lý do: trên APFS, ảnh gốc dùng chung block với cache.

**Bài học 4:** mọi thao tác **có thể xoá dữ liệu hoặc gõ phím** phải chạy trong môi trường dùng xong là bỏ. Với dân bảo mật, nguyên tắc này quen thuộc (least privilege, sandbox), nhưng với agent thì phải áp dụng chặt hơn nữa.

## Bộ nhớ của bot: ghi ra hay là mất

Context của bot đầy dần theo từng ngày làm việc. Agent tự nén context để chạy tiếp, nhưng nén nhiều lần thì rơi bớt chi tiết. Đến lúc phải mở chat mới thì bot quên sạch những gì chỉ nằm trong hội thoại.

Lần đầu mở chat mới cho javis, mình gặp ngay một cái bẫy. Item và worker vẫn còn, nhưng **các worker đang chạy tiếp tục gửi kết quả về chat cũ**, mà chat cũ đã đóng và không nhận thư nữa. Việc bị kẹt cho đến khi bot nhắn từng worker đổi địa chỉ báo cáo.

Vì thế quy tắc bây giờ là: trước khi mở chat mới, bot phải ghi mọi việc đang dở và các thoả thuận còn hiệu lực ra file handoff. Và đó cũng là lý do có **richard**: mỗi tối 21:00, nó đọc nhật ký của mình và của mọi bot, rồi gộp vào một wiki [Obsidian](https://obsidian.md) có liên kết chéo. Wiki này dựng theo kiểu "LLM wiki": AI tự viết và giữ, còn tài liệu gốc thì để nguyên. Chính bài bạn đang đọc được viết từ wiki đó.

**Bài học 5:** coi bộ nhớ của bot như **nhật ký ca trực**. Cái gì chưa ghi ra file thì coi như chưa xảy ra.

## Câu hỏi thường gặp

### Công ty một người có cần biết code không?
Không bắt buộc, nhưng rất nên. Mô hình này dịch chuyển công việc từ *làm* sang *duyệt*, và bạn chỉ duyệt tốt thứ mình hiểu. Với dự án phần mềm, hiểu PR, CI và rủi ro bảo mật giúp bạn phát hiện khi agent làm sai.

### Chạy nhiều AI agent có tốn kém không?
Có, nếu không có quy trình. Chi phí đến từ các vòng lặp: review lại, rebase, đọc lại báo cáo dài. Giới hạn số vòng sửa, dùng model nhỏ cho bước dễ và kiểm tra theo rủi ro giúp giảm đáng kể mà không hạ chất lượng.

### Có nên cho AI agent tự merge code?
Chỉ khi có hai điều kiện: một lần review độc lập nói "sẵn sàng", **và** CI xanh. Với PR bảo mật hoặc xoá dữ liệu, lần review đó phải có lab và tấn công thử. Ngoài ra, mình vẫn giữ quyền chặn bất kỳ lúc nào.

### Làm sao để AI agent không làm hỏng máy thật?
Chạy mọi thứ rủi ro trong VM hoặc container dùng xong là bỏ. Đặt chốt chặn môi trường ngay trong script, và cấm agent điều khiển giao diện trên máy thật. Lời dặn trong prompt là chưa đủ.

## Kết: tuần sau mình sẽ làm gì

Sau 7 ngày, công ty một người của mình chưa phải cỗ máy tự chạy, nhưng mình đã thôi là nút thắt. Ba điều đáng nhớ nhất:

1. Chia việc theo **mảng trách nhiệm** và giao điều phối cho bot.
2. Đặt **model mạnh ở chỗ phán đoán khó**, rồi giới hạn số vòng lặp.
3. Mọi thứ rủi ro chạy trong **môi trường dùng xong là bỏ**, và mọi thứ quan trọng được **ghi ra file**.

Tuần sau mình sẽ đo token thật thay vì ước lượng, và viết riêng từng chủ đề: quy trình code nhiều agent, dựng VM macOS cho QA, và cách tổ chức bộ não thứ 2 bằng Obsidian.

Nếu bạn cũng đang vận hành công ty một người bằng AI agent, hãy để lại bình luận: bạn chia việc cho agent thế nào, và đã từng "suýt toang" ở đâu?

