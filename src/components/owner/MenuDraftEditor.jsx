import { useEffect, useState } from 'react';
import {
  Check,
  Edit3,
  EyeOff,
  Globe,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  deleteDraftMenuItem,
  fetchDraftMenuItems,
  saveDraftMenuItem,
  setRestaurantMenuPublished,
  uploadMenuImage,
} from '../../services/menuService';
import { formatPeso } from '../../utils/restaurantNormalizer';
import ImageWithFallback from '../common/ImageWithFallback';

const EMPTY_DISH = {
  id: null,
  name: '',
  category: 'Main Dishes',
  price: '',
  description: '',
  image_url: '',
  available: true,
};

const SUGGESTED_CATEGORIES = [
  'Main Dishes',
  'Appetizers',
  'Rice Meals',
  'Noodles & Soup',
  'Desserts',
  'Beverages',
];

export default function MenuDraftEditor({ claim, onStatusChange }) {
  const [items, setItems] = useState(null);
  const [formItem, setFormItem] = useState(EMPTY_DISH);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!claim?.id) return;
    const controller = new AbortController();
    setError('');

    fetchDraftMenuItems(claim.id, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setItems(data);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message || 'Could not load menu draft items.');
        }
      });

    return () => controller.abort();
  }, [claim?.id]);

  const updateField = (field, value) => {
    setFormItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    setNotice('');

    try {
      const publicUrl = await uploadMenuImage(claim.id, file);
      updateField('image_url', publicUrl);
      setNotice('Dish photograph uploaded to Supabase Storage.');
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSaveDish = async (event) => {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const saved = await saveDraftMenuItem(claim.id, formItem);
      setItems((prev) =>
        [...(prev || []).filter((entry) => entry.id !== saved.id), saved].sort(
          (a, b) =>
            a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
        )
      );
      setFormItem(EMPTY_DISH);
      const msg = formItem.id ? 'Draft dish updated.' : 'Dish added to menu draft.';
      setNotice(msg);
      if (onStatusChange) onStatusChange(msg);
    } catch (err) {
      setError(err.message || 'Failed to save draft dish.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveDish = async (itemId) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');

    try {
      await deleteDraftMenuItem(claim.id, itemId);
      setItems((prev) => (prev || []).filter((entry) => entry.id !== itemId));
      if (formItem.id === itemId) {
        setFormItem(EMPTY_DISH);
      }
      setNotice('Dish removed from draft.');
    } catch (err) {
      setError(err.message || 'Failed to remove dish.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishToggle = async (publish) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');

    try {
      await setRestaurantMenuPublished(claim.id, publish);
      const msg = publish
        ? `Menu published live for ${claim.restaurant_name}.`
        : `Menu unpublished for ${claim.restaurant_name}.`;
      setNotice(msg);
      if (onStatusChange) onStatusChange(msg);
    } catch (err) {
      setError(err.message || 'Could not update published menu status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="editorial-card"
      aria-label={`Menu Editor for ${claim.restaurant_name}`}
    >
      <div className="editorial-card-header">
        <div>
          <span className="editorial-kicker">Approved Kitchen Menu Editor</span>
          <h2 className="serif-heading" style={{ fontSize: '1.35rem', marginTop: '2px' }}>
            {claim.restaurant_name} — Menu &amp; Pricing
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-editorial btn-editorial-ink btn-sm"
            disabled={busy || !items?.length}
            onClick={() => handlePublishToggle(true)}
          >
            <Globe size={13} aria-hidden="true" />
            <span>Publish Menu</span>
          </button>

          <button
            type="button"
            className="btn-editorial btn-sm"
            disabled={busy}
            onClick={() => handlePublishToggle(false)}
          >
            <EyeOff size={13} aria-hidden="true" />
            <span>Unpublish</span>
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.83rem', color: 'var(--color-secondary)', marginBottom: '14px' }}>
        Save dishes to your private draft below, then click <strong>Publish Menu</strong> to make
        them visible on the public restaurant page.
      </p>

      {error && (
        <div className="editorial-alert" role="alert" style={{ marginBottom: '14px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {notice && (
        <div className="editorial-alert" role="status" style={{ marginBottom: '14px' }}>
          {notice}
        </div>
      )}

      {/* Existing Draft Items Table */}
      <div style={{ marginBottom: '22px' }}>
        <h3 className="editorial-kicker" style={{ marginBottom: '10px' }}>
          Draft Menu Items ({items ? items.length : '…'})
        </h3>

        {!items ? (
          <p role="status" style={{ fontSize: '0.84rem', color: 'var(--color-secondary)' }}>
            Loading draft dishes…
          </p>
        ) : items.length === 0 ? (
          <p
            style={{
              padding: '16px',
              border: 'var(--rule-thin)',
              backgroundColor: 'var(--color-background)',
              fontSize: '0.84rem',
              color: 'var(--color-secondary)',
            }}
          >
            No draft dishes yet. Add your first dish using the form below.
          </p>
        ) : (
          <div style={{ borderTop: 'var(--rule-ink)' }}>
            {items.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '52px minmax(0, 1fr) auto',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: 'var(--rule-thin)',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    border: 'var(--rule-thin)',
                    overflow: 'hidden',
                  }}
                >
                  <ImageWithFallback src={entry.image_url} alt={entry.name} size={28} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ fontFamily: 'var(--font-serif)', fontSize: '0.98rem' }}>
                      {entry.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                      [{entry.category}]
                    </span>
                    <strong style={{ fontFamily: 'var(--font-serif)' }}>
                      {formatPeso(entry.price)}
                    </strong>
                    {!entry.available && (
                      <span className="editorial-tag">Unavailable</span>
                    )}
                  </div>
                  {entry.description && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', marginTop: '2px' }}>
                      {entry.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-editorial btn-sm"
                    disabled={busy}
                    onClick={() =>
                      setFormItem({
                        id: entry.id,
                        name: entry.name,
                        category: entry.category,
                        price: String(entry.price),
                        description: entry.description || '',
                        image_url: entry.image_url || '',
                        available: entry.available,
                      })
                    }
                  >
                    <Edit3 size={12} aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn-editorial btn-editorial-ghost btn-sm"
                    disabled={busy}
                    onClick={() => handleRemoveDish(entry.id)}
                  >
                    <Trash2 size={12} aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dish Form */}
      <form
        onSubmit={handleSaveDish}
        className="editorial-form-stack"
        style={{
          padding: '18px',
          border: 'var(--rule-ink)',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <h3 className="serif-heading" style={{ fontSize: '1.1rem' }}>
          {formItem.id ? `Editing Dish: ${formItem.name}` : 'Add a New Menu Item'}
        </h3>

        <div className="editorial-field-row">
          <label className="editorial-field-label">
            <span>Dish Name</span>
            <input
              type="text"
              className="editorial-input"
              maxLength={120}
              required
              value={formItem.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="e.g. Cebu Lechon Belly Plate"
            />
          </label>

          <label className="editorial-field-label">
            <span>Category</span>
            <input
              type="text"
              list="foodfinder-menu-categories"
              className="editorial-input"
              maxLength={80}
              required
              value={formItem.category}
              onChange={(event) => updateField('category', event.target.value)}
              placeholder="e.g. Main Dishes"
            />
            <datalist id="foodfinder-menu-categories">
              {SUGGESTED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </label>
        </div>

        <div className="editorial-field-row">
          <label className="editorial-field-label">
            <span>Price in Philippine Pesos (₱)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="99999999.99"
              className="editorial-input"
              required
              value={formItem.price}
              onChange={(event) => updateField('price', event.target.value)}
              placeholder="185.00"
            />
          </label>

          <label className="editorial-field-label">
            <span>Availability Status</span>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                fontSize: '0.86rem',
                textTransform: 'none',
                fontWeight: 500,
                color: 'var(--color-primary)',
              }}
            >
              <input
                type="checkbox"
                checked={formItem.available}
                onChange={(event) => updateField('available', event.target.checked)}
              />
              <span>Dish is currently available to order</span>
            </label>
          </label>
        </div>

        <label className="editorial-field-label">
          <span>Short Description</span>
          <textarea
            rows={2}
            maxLength={1500}
            className="editorial-textarea"
            value={formItem.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe key ingredients, preparation, or serving size…"
          />
        </label>

        <div className="editorial-field-row">
          <label className="editorial-field-label">
            <span>Photo URL (https://)</span>
            <input
              type="url"
              pattern="https://.+"
              maxLength={2048}
              className="editorial-input"
              value={formItem.image_url}
              onChange={(event) => updateField('image_url', event.target.value)}
              placeholder="https://..."
            />
          </label>

          <div className="editorial-field-label">
            <span>Or Upload Dish Photo (Supabase Storage)</span>
            <label
              className="btn-editorial"
              style={{
                cursor: uploadingImage || busy ? 'not-allowed' : 'pointer',
                justifyContent: 'center',
              }}
            >
              <Upload size={13} aria-hidden="true" />
              <span>{uploadingImage ? 'Uploading Photo…' : 'Upload Image File'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileUpload}
                disabled={uploadingImage || busy}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="btn-editorial btn-editorial-ink"
            disabled={busy || uploadingImage}
          >
            {formItem.id ? <Check size={14} /> : <Plus size={14} />}
            <span>{formItem.id ? 'Update Draft Dish' : 'Save Dish to Draft'}</span>
          </button>

          {formItem.id && (
            <button
              type="button"
              className="btn-editorial"
              disabled={busy}
              onClick={() => setFormItem(EMPTY_DISH)}
            >
              <span>Cancel Edit</span>
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
