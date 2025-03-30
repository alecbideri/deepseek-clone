# DeepSeek Chat Interface Clone

[Deepseek clone](https://deepseek-clone-self.vercel.app/) This project is a web application designed to replicate the user interface and core conversational functionality of the **DeepSeek AI chat platform**. It provides a clean, responsive interface allowing users to interact with the powerful DeepSeek language models.

Built with modern web technologies, this clone features:

* **User Authentication:** Secure sign-up and sign-in functionality powered by Clerk.
* **Chat Persistence:** Conversation history is stored and retrieved using MongoDB.
* **Real-time Interaction:** Seamless communication with the DeepSeek API for AI-generated responses.
* **Modern UI:** A responsive user interface built with Next.js, React, and styled using Tailwind CSS.

This project serves as a practical example of integrating front-end frameworks, authentication services, databases, and third-party AI APIs to create a functional chat application.

---

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/)
* **Language:** JavaScript
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Authentication:** [Clerk](https://clerk.com/)
* **Database:** [MongoDB](https://www.mongodb.com/) (with Mongoose)
* **AI:** [DeepSeek API](https://platform.deepseek.com/)

---

## Getting Started

Follow these steps to set up and run the project locally:

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
* [Git](https://git-scm.com/)
* A MongoDB database instance (e.g., a free cluster from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
* A [Clerk](https://clerk.com/) application set up.
* A [DeepSeek](https://platform.deepseek.com/) API Key.

### Installation & Setup

1.  **Clone the Repository:**
    ```
    git clone https://github.com/alecbideri/deepseek-clone.git
    ```


2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**

    Create a file named `.env.local` in the root directory of the project. Copy the following variable names into the file and replace the placeholder values with your actual credentials.

    ```plaintext
    # MongoDB Connection String (Get from MongoDB Atlas or your instance)
    MONGODB_URI=your_mongodb_connection_string

    # Clerk Authentication Credentials (Get from your Clerk Application Dashboard)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
    CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

    # Clerk App Configuration (Configure these URLs in your Clerk Dashboard too)
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

    # Clerk Webhook Signing Secret (Get from Clerk Dashboard -> Webhooks section)
    # Required for reliable backend actions triggered by Clerk events
    CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret

    # DeepSeek API Key (Get from your DeepSeek Platform account)
    DEEPSEEK_API_KEY=your_deepseek_api_key
    ```

    **Important:**
    * Never commit your `.env.local` file to version control. The `.gitignore` file should already be configured to prevent this.
    * Ensure the URLs in the Clerk environment variables match the configuration within your Clerk application dashboard.

### Running the Development Server

1.  **Start the application:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:3000`. You should be able to sign up or sign in using Clerk and start interacting with the chat interface.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for bugs, features, or improvements.

---

## Business Inquiries

For business inquiries, please write via email: [alecbideri@gmail.com](mailto:alecbideri@gmail.com)

---
