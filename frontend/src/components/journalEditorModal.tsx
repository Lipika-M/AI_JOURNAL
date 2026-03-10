import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import journalApi from '../api/journal.api';
import type { Journal } from '../types/journal.type';
import { getSafeErrorMessage } from '../utils/safeErrorMessage';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  journal?: Journal | null;
}

interface FormData {
  title: string;
  content: string;
  tags: string;
}

interface FormErrors {
  title?: string;
  content?: string;
}

const JournalEditorModal = ({ onClose, onSuccess, journal }: Props) => {
  const isEditMode = !!journal;
  const [formData, setFormData] = useState<FormData>({
    title: journal?.title || '',
    content: journal?.content || '',
    tags: journal?.tags?.join(', ') || '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    if (journal) {
      setFormData({
        title: journal.title,
        content: journal.content,
        tags: journal.tags?.join(', ') || '',
      });
    }
  }, [journal]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 2) {
      setError('You can upload a maximum of 2 images of max 5MB each');
      e.target.value = '';
      return;
    }

    setError(null);
    setSelectedImages(files);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (isEditMode && journal) {
        await journalApi.updateJournal(journal._id, {
          title: formData.title,
          content: formData.content,
          tags: tags.length > 0 ? tags : undefined,
          images: selectedImages.length ? selectedImages : undefined,
        });
      } else {
        await journalApi.createJournal({
          title: formData.title,
          content: formData.content,
          tags: tags.length > 0 ? tags : undefined,
          images: selectedImages.length ? selectedImages : undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        getSafeErrorMessage(
          err,
          `Failed to ${isEditMode ? 'update' : 'create'} journal`
        )
      );
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} journal:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/70 backdrop-blur-md rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/60">
        {/* Header */}
        <div className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-white/60 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {isEditMode ? 'Edit Journal' : 'Create New Journal'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition p-1"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-4 sm:mx-6">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your journal a title"
              className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition sm:h-12 sm:text-base ${
                formErrors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isLoading}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          {/* Content Field */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={12}
              value={formData.content}
              onChange={handleChange}
              placeholder="Start writing your thoughts..."
              className={`min-h-[220px] w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition sm:min-h-[260px] sm:text-base ${
                formErrors.content
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isLoading}
            />
            {formErrors.content && (
              <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
            )}
          </div>

          {/* Tags Field */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="work, personal, ideas (comma separated)"
              className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition sm:h-12 sm:text-base"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
          </div>

          {/* Images Field */}
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
              Images (max 2)
            </label>
            <input
              id="images"
              name="images"
              type="file"
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-slate-700 hover:file:bg-slate-200 sm:file:mr-3 sm:file:px-3"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              {isEditMode
                ? 'Upload up to 2 images. Selecting new images will replace existing images.'
                : 'Upload up to 2 images (JPG, PNG, WEBP).'}
            </p>

            {selectedImages.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">
                {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end sm:gap-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-6 py-2 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                isEditMode ? 'Update Journal' : 'Save Journal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalEditorModal;
