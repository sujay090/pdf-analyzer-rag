'use client'

import { Upload } from 'lucide-react'

const FileUploadComponent: React.FC = () => {
    const handleFileUpload = () => {
        const el = document.createElement('input')
        el.setAttribute('type', 'file');
        el.setAttribute('accept', 'application/pdf')
        el.addEventListener('change', async (e) => {
            const target = e.target as HTMLInputElement
            const file = target?.files?.[0]
            if (file) {
                const formData = new FormData()
                formData.append('pdf', file)
                try {
                    await fetch('http://localhost:4000/api/upload', {
                        method: 'POST',
                        body: formData
                    })
                    console.log("file upload successfully")
                } catch (err) {
                    console.log(err)
                }
            }
        })
        el.click()

    }
    return (
        <div className='bg-gray-800 text-white shadow-2xl flex justify-center items-center p-4 rounded-2xl border-2 border-gray-200'>
            <div onClick={handleFileUpload} className='flex justify-center items-center flex-col'>
                <h3>File Upload</h3>
                <Upload />
            </div>
        </div>
    )
}

export default FileUploadComponent