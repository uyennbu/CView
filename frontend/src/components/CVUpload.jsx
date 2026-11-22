
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

  // Hỗ trợ thao tác bằng bàn phím
  const handleUploadKeyDown = (event) => {
    if (event.target !== event.currentTarget) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div className="mx-auto w-full max-w-[850px] min-w-0">
      {/* Upload Area */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Chọn hoặc kéo thả file CV PDF hoặc DOCX"
        onKeyDown={handleUploadKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex min-h-[220px] w-full min-w-0
          flex-col items-center justify-center
          gap-4 rounded-2xl border-2 border-dashed
          px-4 py-7 text-center
          transition-all duration-200
          focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-cview-green
          focus-visible:ring-offset-2
          sm:min-h-[250px] sm:gap-5 sm:px-8 sm:py-9
          ${
            isDragging
              ? 'scale-[1.01] border-cview-green bg-cview-mint/70'
              : 'cursor-pointer border-cview-green bg-white hover:bg-cview-mint/20'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          className="hidden"
          aria-label="Chọn file CV"
        />

        {!file ? (
          <>
            {/* Upload Icon */}
            <div className="
              flex h-14 w-14 shrink-0 items-center justify-center
              rounded-full bg-cview-mint
              sm:h-16 sm:w-16
            ">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-cview-primary sm:h-9 sm:w-9"
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

            {/* Upload Instructions */}
            <div className="w-full min-w-0">
              <h2 className="
                break-words text-lg font-bold leading-snug
                text-cview-dark
                sm:text-xl md:text-2xl
              ">
                {isDragging
                  ? 'Thả CV của bạn vào đây'
                  : 'Kéo thả CV của bạn vào đây'}
              </h2>

              <p className="
                mx-auto mt-2 max-w-md
                text-xs leading-relaxed text-gray-500
                sm:text-sm
              ">
                Hoặc nhấn vào khu vực này để chọn file từ thiết bị
              </p>
            </div>

            {/* Supported Formats */}
            <div className="
              flex flex-wrap items-center
              justify-center gap-2
            ">
              <span className="
                rounded-full bg-cview-mint
                px-3 py-1 text-xs font-semibold
                text-cview-primary
              ">
                PDF
              </span>

              <span className="
                rounded-full bg-cview-mint
                px-3 py-1 text-xs font-semibold
                text-cview-primary
              ">
                DOCX
              </span>

              <span className="text-xs text-gray-500">
                Tối đa 10MB
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Selected File Icon */}
            <div className="
              flex h-14 w-14 shrink-0 items-center justify-center
              rounded-full bg-cview-mint
              sm:h-16 sm:w-16
            ">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-cview-primary sm:h-9 sm:w-9"
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

            {/* File Information */}
            <div className="w-full min-w-0 px-2 text-center">
              <p className="
                break-all text-sm font-bold
                leading-relaxed text-cview-dark
                sm:text-base
              ">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                {formatFileSize(file.size)}
              </p>

              <p className="
                mt-2 text-sm font-semibold
                text-cview-primary
              ">
                Đã chọn CV thành công!
              </p>
            </div>

            {/* Remove File */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                handleRemoveFile()
              }}
              className="
                rounded-full border border-red-200
                px-4 py-2 text-xs font-semibold
                text-red-500 transition
                hover:bg-red-50
                sm:text-sm
              "
            >
              Xóa file
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p
          role="alert"
          className="
            mt-3 px-2 text-center
            text-xs font-medium leading-relaxed
            text-red-500 sm:text-sm
          "
        >
          {error}
        </p>
      )}

      {/* Action Buttons */}
      <div className="
        mt-5 grid w-full grid-cols-1
        gap-3 sm:grid-cols-2 sm:gap-4
      ">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="
            flex min-h-12 w-full items-center
            justify-center rounded-xl
            bg-cview-accent px-5 py-3
            text-sm font-bold text-white
            shadow-sm transition
            hover:-translate-y-0.5 hover:brightness-105
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-cview-accent
            focus-visible:ring-offset-2
          "
        >
          Tải tệp lên
        </button>

        <button
          type="button"
          disabled={!file || !onAnalyze}
          onClick={() => file && onAnalyze?.(file)}
          className="
            flex min-h-12 w-full items-center
            justify-center rounded-xl
            bg-cview-accent px-5 py-3
            text-sm font-bold text-white
            shadow-sm transition
            hover:-translate-y-0.5 hover:brightness-105
            disabled:cursor-not-allowed
            disabled:opacity-50
            disabled:hover:translate-y-0
            focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-cview-accent
            focus-visible:ring-offset-2
          "
        >
          Phân tích
        </button>
      </div>
    </div>
  )
}
