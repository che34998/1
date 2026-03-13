# Aegisgo - 智能旅行安全助手 🛡️

Aegisgo 是一款基於 AI 驅動的旅行安全應用程序，旨在為全球旅行者提供即時的安全資訊、風險評估和社群警報。透過結合 Google Gemini AI 的強大分析能力與即時地圖數據，Aegisgo 讓您的旅程更加安心。

![Aegisgo Preview](https://picsum.photos/seed/aegisgo/800/400)

## 🌟 主要功能

- **📍 即時安全地圖**：視覺化展示全球各城市的安全指數，並標註即時安全事件。
- **🤖 AI 安全評估**：利用 Gemini AI 針對特定國家提供深入的風險分析與旅行建議。
- **📢 社群回報系統**：使用者可以即時發佈和查看周邊的安全事件（如交通、治安、災害等）。
- **🚨 緊急救援支援**：快速獲取當地警察、救護車及消防局的聯絡電話。
- **✨ 現代化 UI**：簡潔、明亮的介面設計，支援流暢的動畫與交互。

## 🛠️ 技術棧

- **前端**: React 19, Vite, Tailwind CSS 4
- **地圖**: Leaflet, React Leaflet
- **AI**: Google Gemini API (@google/genai)
- **動畫**: Framer Motion
- **後端**: Express, tsx
- **語言**: TypeScript

## 🚀 快速開始

### 1. 克隆項目

```bash
git clone https://github.com/your-username/aegisgo.git
cd aegisgo
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 配置環境變量

在項目根目錄下創建 `.env` 文件（可以參考 `.env.example`）：

```bash
cp .env.example .env
```

編輯 `.env` 文件，填入您的 **Gemini API Key**：

```env
GEMINI_API_KEY=您的_API_KEY_在此
```

> **如何獲取 API Key?**
> 您可以前往 [Google AI Studio](https://aistudio.google.com/) 免費獲取您的 Gemini API Key。

### 4. 啟動開發服務器

```bash
npm run dev
```

現在您可以訪問 `http://localhost:3000` 查看應用。

## 🔒 安全性說明

- **隱藏 API Key**: 本項目使用 `dotenv` 管理環境變量。請確保您的 `.env` 文件已列入 `.gitignore`，切勿將其提交至 GitHub。
- **客戶端安全**: 在生產環境中，建議將 API 調用移至後端代理，以進一步保護您的 API Key。

## 📄 開源協議

本項目採用 **MIT 協議**。您可以自由地使用、修改和分發本代碼，但請保留原作者的署名。

## 🤝 貢獻

歡迎提交 Pull Request 或回報 Issue！請參閱 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解更多詳情。

---

製作人：[hcw9406](https://github.com/hcw9406)
