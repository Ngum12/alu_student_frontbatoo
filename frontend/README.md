# ALU Student Companion Deployment

## Hugging Face Space Deployment

1. Create a new Space on Hugging Face (Docker template)
2. Upload your code (excluding large files in .gitignore)
3. Connect GitHub repository for CI/CD
4. Configure build settings in the Space settings

## Environment Variables

Set these in your Hugging Face Space:

- `PORT`: 8080 (default)

# ALU Student Companion Chatbot

![ALU Chatbot](https://via.placeholder.com/800x400?text=ALU+Student+Companion+Chatbot)

## Overview

The ALU Student Companion is an advanced AI-powered chatbot designed specifically for African Leadership University students, faculty, and administrators. It provides instant access to university information, academic resources, and administrative support through a conversational interface.

## Features

- **AI-Powered Conversations**: Get accurate responses to questions about ALU
- **Rich Message Formatting**: Support for markdown, code blocks, tables, and more
- **Knowledge Base Integration**: Access ALU-specific information and resources
- **Feedback System**: Rate responses and help improve the system
- **Multi-Model Support**: Choose between different AI models
- **Customizable Settings**: Adjust AI behavior and response styles
- **Admin Dashboard**: Monitor usage and configure system parameters
- **API Documentation**: Resources for developers integrating with the system

## Screenshots

<div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <img src="https://via.placeholder.com/380x220?text=Chat+Interface" alt="Chat Interface" width="48%"/>
    <img src="https://via.placeholder.com/380x220?text=Admin+Dashboard" alt="Admin Dashboard" width="48%"/>
</div>

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI
- **Syntax Highlighting**: React Syntax Highlighter
- **Markdown Rendering**: React Markdown
- **State Management**: React Context API
- **Backend**: Node.js (optional Hugging Face integration)
- **AI Models**: Claude, GPT, Hugging Face models

## Installation

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/alu-student-companion.git
cd alu-student-companion
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_BACKEND_URL=http://localhost:5000
VITE_DEFAULT_MODEL=claude
```

### Step 4: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage Guide

### For Students

1. **Ask Questions**: Type any question about ALU, academics, campus life, etc.
2. **View History**: Scroll through previous conversations
3. **Provide Feedback**: Rate answers with thumbs up/down to improve responses
4. **Customize Settings**: Adjust the UI and chatbot behavior in Settings

### For Faculty

1. **Access Additional Resources**: Faculty accounts have access to beta features
2. **Knowledge Management**: Suggest improvements to the knowledge base
3. **Advanced Settings**: Configure the AI assistant for classroom use

### For Administrators

1. **Login to Admin Panel**: Use admin credentials in the Settings page
2. **Monitor Usage**: View analytics on usage patterns and user satisfaction
3. **Configure Features**: Enable/disable features and adjust system settings
4. **Review Feedback**: Access user feedback to improve the system

## Admin Features

### Accessing Admin Features

1. Navigate to the Settings page
2. Click on the "Advanced" tab
3. Login with admin credentials:
   - Email: `d.ngum@alustudent.com` or `d.ngumadmin@alustudent.com`
   - Password: Contact system administrator

### Available Admin Tools

- **Analytics Dashboard**: View usage statistics and patterns
- **Feature Management**: Enable/disable features for different user roles
- **Feedback Review**: Analyze user feedback and satisfaction metrics
- **API Console**: Test API endpoints and view documentation
- **System Configuration**: Adjust core system parameters

## Configuration Options

### Model Parameters

- **Temperature**: Controls randomness (0.0-2.0)
- **Top P**: Controls diversity (0.0-1.0)
- **Max Tokens**: Controls response length
- **Presence Penalty**: Reduces topic repetition
- **Frequency Penalty**: Reduces phrase repetition

### Knowledge Sources

- Academic Programs
- Campus Life
- Student Resources
- Faculty Profiles
- Course Descriptions

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**: Verify backend URL in settings
2. **Slow Responses**: Adjust model parameters or check network connection
3. **Admin Access Issues**: Clear browser cache and try logging in again

### Getting Help

For additional support, contact the development team at `support@alustudent.com`.

## Contributing

We welcome contributions to the ALU Student Companion project! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- African Leadership University for supporting this project
- The development team for their hard work and dedication
- All students and faculty who provided feedback during testing

---

© 2025 ALU Student Companion Team
