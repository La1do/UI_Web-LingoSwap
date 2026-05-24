# Huong Dan Chay Bo Test SQA Frontend

Tai lieu nay huong dan cach cai dat, chay test va xem bang chung test cho frontend LingoSwap.

Thu muc `sqa-evidence/` la artifact local de phuc vu bao cao SQA. Thu muc nay da duoc ignore trong `.gitignore`, nen khong anh huong den branch `main` va khong tu dong duoc dua len git.

## 1. Chuan Bi Moi Truong

Mo terminal tai dung thu muc frontend:

```powershell
cd /d D:\UI-LingoSwap
```

Neu dung PowerShell va `cd /d` khong chay, dung:

```powershell
Set-Location D:\UI-LingoSwap
```

Khong chay cac lenh nay trong backend repo, vi script nam trong frontend repo.

Sai thu muc se gap loi dang:

```text
Cannot find module '...\sqa-evidence\scripts\run-playwright-ui.mjs'
```

## 2. Cai Dependencies

Neu may chua co dependencies frontend:

```powershell
npm install
```

Neu Playwright chua duoc cai:

```powershell
npm install -D @playwright/test
npx playwright install chromium
```

Kiem tra nhanh:

```powershell
node -v
npm -v
```

## 3. Chay Dashboard Xem Evidence

Dashboard chi la trang xem bao cao test, khong phai app chinh.

Chay:

```powershell
python -m http.server 8088 --directory D:\UI-LingoSwap\sqa-evidence
```

Mo trinh duyet:

```text
http://localhost:8088/index.html
```

Neu bi 404, thu:

```powershell
python -m http.server 8090 --directory D:\UI-LingoSwap\sqa-evidence
```

Va mo:

```text
http://localhost:8090/index.html
```

Luu y:

- `http://localhost:8088` la dashboard xem evidence.
- `http://127.0.0.1:5173` la app frontend that duoc Playwright mo de test.
- Viec co 2 server la dung thiet ke: mot server de xem bao cao, mot server de chay app duoc test.

## 4. Chay Frontend Static/Build Checks

Lenh:

```powershell
node sqa-evidence\scripts\run-frontend-checks.mjs
```

Lenh nay chay:

- TypeScript: `npx.cmd tsc --noEmit`
- ESLint: `npx.cmd eslint src`
- Vite Build: `npm.cmd run build`

Ket qua duoc in truc tiep ra terminal. Cuoi lenh se co summary dang:

```text
=== Frontend Checks Summary ===
Status: PASS/FAIL
Total: 3
Passed: ...
Failed: ...
```

File ket qua:

```text
sqa-evidence\data\frontend-check-summary.json
sqa-evidence\data\tsc-output.txt
sqa-evidence\data\eslint-output.txt
sqa-evidence\data\build-output.txt
```

Hien tai neu ESLint fail thi khong co nghia Playwright fail. No chi cho thay code dang co loi lint can sua.

## 5. Chay Playwright UI Test

Chay nhanh, khong mo browser:

```powershell
node sqa-evidence\scripts\run-playwright-ui.mjs
```

Lenh nay se:

- Tu chay Vite app o `http://127.0.0.1:5173`
- Mo Chromium de test UI
- In tung test dang chay ra terminal
- In tong so pass/fail/skipped
- Tao HTML report va JSON evidence

Ket qua terminal se co dang:

```text
Running 16 tests using 6 workers
ok ... admin-ui.spec.ts ...
ok ... auth-validation.spec.ts ...

=== Playwright UI Summary ===
Status: PASS
Total: 16
Passed: 16
Failed: 0
Skipped: 0
```

Chay truc quan de thay browser thao tac:

```powershell
node sqa-evidence\scripts\run-playwright-ui.mjs --headed --record --slow
```

Y nghia:

- `--headed`: mo browser that tren man hinh.
- `--record`: luu video, trace, screenshot vao report.
- `--slow`: lam cham thao tac de de quan sat.

File ket qua:

```text
sqa-evidence\data\playwright-ui-summary.json
sqa-evidence\data\playwright-tests.json
sqa-evidence\data\playwright-summary.json
sqa-evidence\data\playwright-output.txt
sqa-evidence\data\playwright-report\index.html
```

Mo report:

```text
D:\UI-LingoSwap\sqa-evidence\data\playwright-report\index.html
```

## 6. Chay Tat Ca Bang Mot Lenh

Lenh tong hop:

```powershell
node sqa-evidence\scripts\run-all-checks.mjs
```

Lenh nay chay lan luot:

1. Frontend static/build checks
2. Playwright UI checks

Cuoi lenh se co summary dang:

```text
######## Full SQA Run Summary ########
Status: PASS/FAIL
Steps: .../... passed
Frontend checks: ...
Playwright UI: ...
```

File ket qua:

```text
sqa-evidence\data\full-run-summary.json
```

Co the chay gop va xem browser:

```powershell
node sqa-evidence\scripts\run-all-checks.mjs --headed --record --slow
```

Flag nay se duoc truyen sang Playwright.

## 7. Cach Doc Ket Qua

Trong dashboard:

- `Tool Evidence`: trang thai tung tool.
- `Playwright Run Summary`: Playwright da chay test nao, pass/fail bao nhieu.
- `Frontend Test Case Checklist`: danh sach FE test case, case nao chay bang Playwright, case nao manual.
- `Artifacts`: link mo cac file evidence.

Trang thai:

- `PASS`: test/check thanh cong.
- `FAIL`: test/check co loi.
- `SKIPPED`: bo qua do thieu dependency hoac dieu kien chay.
- `OPEN/PLANNED`: chua thuc thi hoac de manual.

## 8. Cac So Lieu Hien Tai

Tai thoi diem viet huong dan:

- Tong FE test case tren dashboard: `124`
- FE case co Playwright evidence: `69`
- FE case manual: `55`
- Playwright test scripts: `16`
- Playwright result gan nhat: `16 passed, 0 failed, 0 skipped`
- Frontend static/build:
  - TypeScript: PASS
  - ESLint: FAIL neu project con loi lint hien tai
  - Vite Build: PASS

Neu ESLint fail, xem chi tiet tai:

```text
sqa-evidence\data\eslint-output.txt
```

## 9. Khong Anh Huong Branch Main

Thu muc nay da nam trong `.gitignore`:

```text
sqa-evidence/
```

Vi vay cac file sau chi la local evidence:

```text
sqa-evidence\data\*.json
sqa-evidence\data\*.txt
sqa-evidence\data\playwright-report\
sqa-evidence\tests\
sqa-evidence\scripts\
```

Kiem tra truoc khi commit:

```powershell
git status --short
```

Neu chi thay file trong `sqa-evidence/` thi binh thuong no se khong hien vi da bi ignore.

Khong dung:

```powershell
git add -f sqa-evidence
```

Tru khi muon co y dua artifact test local len git.

## 10. Loi Thuong Gap

### Chay nham backend repo

Loi:

```text
Cannot find module 'D:\lingoswap-backend\sqa-evidence\scripts\...'
```

Cach sua:

```powershell
Set-Location D:\UI-LingoSwap
```

### Dashboard bi 404

Chay lai bang duong dan tuyet doi:

```powershell
python -m http.server 8088 --directory D:\UI-LingoSwap\sqa-evidence
```

Mo:

```text
http://localhost:8088/index.html
```

### Playwright bao thieu browser

Chay:

```powershell
npx playwright install chromium
```

### Port 5173 dang ban

Playwright se reuse server neu da co server Vite o `5173`.

Neu app chay khong dung, tat terminal Vite cu roi chay lai test:

```powershell
node sqa-evidence\scripts\run-playwright-ui.mjs
```

