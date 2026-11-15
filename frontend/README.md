# React + Vite

Đây là template cung cấp cấu hình cơ bản để khởi chạy React trên Vite, hỗ trợ **Hot Module Replacement (HMR)** và tích hợp một số quy tắc kiểm tra mã nguồn bằng **ESLint**.

Hiện tại, có hai plugin chính thức được hỗ trợ:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react): Sử dụng [Oxc](https://oxc.rs/) để xử lý mã nguồn.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc): Sử dụng [SWC](https://swc.rs/) để biên dịch mã nguồn.

## React Compiler

React Compiler hiện chưa được kích hoạt trong template này do có thể ảnh hưởng đến hiệu suất trong quá trình phát triển (development) và build ứng dụng.

Để tích hợp React Compiler, vui lòng tham khảo [tài liệu hướng dẫn cài đặt chính thức](https://react.dev/learn/react-compiler/installation).

## Mở rộng cấu hình ESLint

Nếu phát triển ứng dụng hướng đến môi trường production, chúng tôi khuyến nghị sử dụng **TypeScript** kết hợp với các quy tắc ESLint có khả năng phân tích kiểu dữ liệu (type-aware lint rules).

Bạn có thể tham khảo các tài liệu sau:

- [Template React + TypeScript của Vite](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts): Hướng dẫn tích hợp TypeScript vào dự án.
- [typescript-eslint](https://typescript-eslint.io): Tài liệu hướng dẫn sử dụng ESLint với TypeScript.