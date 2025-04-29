# AutoZone Receipt Generator

A customizable AutoZone-style retail receipt generator built with **Next.js** and **React**. Designed with a Aotozone style and realistic receipt layout, it allows users to input purchase information, generate a live receipt preview, and print it.

---

## 🚀 Features

- 🔧 **Editable Fields** – Store info, items, dates, and messages can be modified in real-time.
- 🖼️ **Logo Upload** – Upload a custom logo to brand your receipt.
- 🧾 **Auto Calculation** – Calculates subtotal, tax (8%), total, and change automatically.
- 📦 **Download Options** – Export your receipt as PDF or ZIP with embedded PNG image.
- 🖨️ **Print Support** – Print the generated receipt directly from the browser.
- ➕ **Add/Remove Items** – Dynamically manage purchased items.
- 🎨 **Themed UI** – Clean modern design with red, blue, and white accents.

---

## 🛠 Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm or yarn

1. Clone the Repository

git clone https://github.com/ankitmishra-13/autozone-receipt.git
cd autozone-receipt

2. Install Dependencies

npm install
 or
yarn

3. Run the Development Server

npm run dev
 or
yarn dev
Then open http://localhost:3000 in your browser.

🧪 How to Use
Fill in the receipt form fields: Date, Time, Items, Cash Paid, etc.

Add your store logo or leave it empty for default.

Preview will update in real-time on the right side.

Click Print, Download PDF, or Download ZIP to export your receipt.

```bash
📂 Project Structure

src/
├── app/
│   └── page.tsx             # Main Receipt Form and Preview
├── components/ui/           # Reusable UI elements (Input, Textarea, Button, etc.)
├── public/                  # Static files like placeholder logos
└── styles/                  # Optional: Tailwind or custom CSS (if extended)
