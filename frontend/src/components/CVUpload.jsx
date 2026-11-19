
import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ACCEPTED_EXTENSIONS = ['pdf', 'docx']

export default function CVUpload({ onAnalyze }) {
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  // Kiểm tra và lưu file được chọn
  const handleFile = (selectedFile) => {
    if (!selectedFile) return

    setError('')

    const extension = selectedFile.name
      .split('.')
      .pop()
      .toLowerCase()

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFile(null)
      setError('Vui lòng chọn file CV định dạng PDF hoặc DOCX.')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null)
      setError('Dung lượng file không được vượt quá 10MB.')
      return
    }

    if (selectedFile.size === 0) {
      setFile(null)
      setError('File không có dữ liệu. Vui lòng chọn file khác.')
      return
    }

    setFile(selectedFile)
  }

  // Chọn file từ thiết bị
  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0])
    event.target.value = ''
  }

  // Khi kéo file vào khu vực upload
  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  // Khi kéo file ra ngoài khu vực upload
  const handleDragLeave = (event) => {
    event.preventDefault()

    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false)
    }
  }

  // Khi thả file vào khu vực upload
  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)

    const droppedFile = event.dataTransfer.files?.[0]
    handleFile(droppedFile)
  }

  // Xóa file đã chọn
  const handleRemoveFile = () => {
    setFile(null)
    setError('')

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  // Chuyển dung lượng file sang MB
  const formatFileSize = (size) => {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <div className="w-full max-w-[850px] mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex min-h-[220px] flex-col items-center justify-center
          gap-4 rounded-xl border-2 border-dashed px-5 py-8
          transition-all duration-200 cursor-pointer
          sm:min-h-[250px] sm:px-8
          ${
            isDragging
              ? 'border-cview-green bg-cview-mint/70 scale-[1.01]'
              : 'border-cview-green bg-white hover:bg-cview-mint/20'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          className="hidden"
        />

        {!file ? (
          <>
            {/* Upload icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cview-mint">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-9 w-9 text-cview-primary"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4" />
                <path d="m7 9 5-5 5 5" />
                <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-cview-dark sm:text-2xl">
                {isDragging
                  ? 'Thả CV của bạn vào đây'
                  : 'Kéo thả CV của bạn vào đây'}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Hoặc nhấn vào khu vực này để chọn file từ thiết bị
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-cview-mint px-3 py-1 text-xs font-semibold text-cview-primary">
                PDF
              </span>
              <span className="rounded-full bg-cview-mint px-3 py-1 text-xs font-semibold text-cview-primary">
                DOCX
              </span>
              <span className="text-xs text-gray-500">
                Tối đa 10MB
              </span>
            </div>
          </>
        ) : (
          <>
            {/* File đã chọn */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cview-mint">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-9 w-9 text-cview-primary"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>

            <div className="max-w-full text-center">
              <p className="break-all font-bold text-cview-dark">
                {file.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {formatFileSize(file.size)}
              </p>

              <p className="mt-2 text-sm font-semibold text-cview-primary">
                Đã chọn CV thành công!
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleRemoveFile()
              }}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              Xóa file
            </button>
          </>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-center text-sm font-medium text-red-500"
        >
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-cview-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105"
        >
          Tải tệp lên
        </button>

        <button
          type="button"
          disabled={!file || !onAnalyze}
          onClick={() => file && onAnalyze?.(file)}
          className="rounded-xl bg-cview-accent px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Phân tích
        </button>
      </div>
    </div>
  )
}
