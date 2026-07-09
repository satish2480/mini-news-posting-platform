import React, { useEffect, useState } from "react";
import ArticleEditor from "./ArticleEditor";
import { normalizeEditorValue, toPlainText } from "../utils/richText";

const initialForm = {
  headline: "",
  content: "",
  category: "General",
  imageUrl: "",
  imageFile: null,
  sourceName: "",
  sourceUrl: ""
};

const categories = [
  "General",
  "Politics",
  "Business",
  "Science",
  "Sports",
  "Weather",
  "Infrastructure",
  "Education",
  "Health",
  "Technology",
  "Travel",
  "Environment"
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

function NewsForm({ onSubmit, isSubmitting, uploadProgress, submitError }) {
  const [form, setForm] = useState(initialForm);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editorError, setEditorError] = useState("");
  const [fileError, setFileError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (!form.imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(form.imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.imageFile]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;

    if (!nextFile) {
      setForm((current) => ({ ...current, imageFile: null }));
      setFileError("");
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(nextFile.type)) {
      setForm((current) => ({ ...current, imageFile: null }));
      setPreviewUrl("");
      setFileInputKey((current) => current + 1);
      setFileError("Please upload a JPG, PNG, WEBP, or GIF image");
      return;
    }

    if (nextFile.size > MAX_IMAGE_SIZE_BYTES) {
      setForm((current) => ({ ...current, imageFile: null }));
      setPreviewUrl("");
      setFileInputKey((current) => current + 1);
      setFileError("Image size must be 5 MB or smaller");
      return;
    }

    setFileError("");
    setForm((current) => ({ ...current, imageFile: nextFile }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (fileError) {
      return;
    }

    const normalizedContent = normalizeEditorValue(form.content);

    if (!toPlainText(normalizedContent)) {
      setEditorError("Article content is required");
      return;
    }

    setEditorError("");

    const didSubmit = await onSubmit({
      ...form,
      content: normalizedContent
    });

    if (didSubmit) {
      setForm(initialForm);
      setPreviewUrl("");
      setFileInputKey((current) => current + 1);
      setEditorError("");
      setFileError("");
    }
  };

  return (
    <section className="panel form-panel post-form-panel">
        <div className="section-label">Reporter Desk</div>
        <h2>File a news update</h2>
        {submitError ? <div className="form-error">{submitError}</div> : null}
        {editorError ? <div className="form-error">{editorError}</div> : null}
        {fileError ? <div className="form-error">{fileError}</div> : null}
        <form className="news-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="headline">Headline</label>
            <input
              id="headline"
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="Enter the story headline"
              required
            />
          </div>

          <div className="post-meta-grid">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="imageUrl">Image URL</label>
              <input
                id="imageUrl"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="imageFile">Upload Image</label>
            <input
              key={fileInputKey}
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
            />
            <div className="field-hint">
              Upload a local image or keep using the URL field above. Max size 5 MB.
            </div>
            {previewUrl ? (
              <div className="upload-preview">
                <img src={previewUrl} alt="Selected upload preview" />
              </div>
            ) : null}
          </div>

          <div className="post-meta-grid">
            <div className="form-field">
              <label htmlFor="sourceName">Source Name</label>
              <input
                id="sourceName"
                name="sourceName"
                value={form.sourceName}
                onChange={handleChange}
                placeholder="Desk or publication name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="sourceUrl">Source URL</label>
              <input
                id="sourceUrl"
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleChange}
                placeholder="https://example.com/story"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="content">Article Content</label>
            <ArticleEditor
              value={form.content}
              onChange={(nextValue) => {
                setForm((current) => ({ ...current, content: nextValue }));
                if (editorError && toPlainText(nextValue)) {
                  setEditorError("");
                }
              }}
              placeholder="Write the article summary or body"
            />
          </div>

          <div className="post-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Story"}
            </button>
          </div>
          {isSubmitting && form.imageFile ? (
            <div className="upload-progress">
              <div className="upload-progress-bar">
                <span style={{ width: `${uploadProgress || 0}%` }} />
              </div>
              <div className="field-hint">Uploading image: {uploadProgress || 0}%</div>
            </div>
          ) : null}
        </form>
    </section>
  );
}

export default NewsForm;
