'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/browserClient'
import { useNavLoaderStore } from '../../lib/store/navLoaderStore'
import { showToast } from '../ui/Toast'
import styles from './ProductForm.module.css'

const SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL']

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 7)
}

export default function ProductForm({ mode, product, categories }) {
  const router = useRouter()
  const startNav = useNavLoaderStore((s) => s.start)
  const fileInputRef = useRef(null)
  // Stable per-form folder for Storage uploads. Existing products upload
  // under their real slug; new products get a draft id so uploads can start
  // before a name (and therefore a final slug) has been typed.
  const uploadFolder = useRef(product?.slug || `draft-${Date.now()}-${randomSuffix()}`)
  const dragIndexRef = useRef(null)

  const [name, setName] = useState(product?.name || '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [originalPrice, setOriginalPrice] = useState(product?.original_price ?? '')
  const [category, setCategory] = useState(product?.category || categories[0]?.name || '')
  const [categoryList, setCategoryList] = useState(categories)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [sizes, setSizes] = useState(product?.sizes || [])
  const [images, setImages] = useState(product?.images?.length ? product.images : (product?.image ? [product.image] : []))
  const [description, setDescription] = useState(product?.description || '')
  const [fabric, setFabric] = useState(product?.fabric || '')
  const [fit, setFit] = useState(product?.fit || '')
  const [careInstructions, setCareInstructions] = useState(product?.care_instructions || '')
  const [measurements, setMeasurements] = useState(product?.measurements || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleSize(size) {
    setSizes((current) =>
      current.includes(size) ? current.filter((s) => s !== size) : [...current, size]
    )
  }

  async function handleAddCategory() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return

    setAddingCategory(true)
    setError('')

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert({ name: trimmed, slug: slugify(trimmed) })
      .select()
      .single()

    setAddingCategory(false)

    if (insertError) {
      setError(`Couldn't add category: ${insertError.message}`)
      return
    }

    setCategoryList((current) => [...current, data])
    setCategory(data.name)
    setNewCategoryName('')
    setShowAddCategory(false)
    showToast(`"${data.name}" category added`)
  }

  async function handleFilesSelected(event) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    setError('')

    const supabase = createClient()
    const uploadedUrls = []

    for (const file of files) {
      const path = `${uploadFolder.current}/${Date.now()}-${randomSuffix()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file)

      if (uploadError) {
        setError(`Couldn't upload "${file.name}": ${uploadError.message}`)
        continue
      }

      const { data: publicData } = supabase.storage.from('product-images').getPublicUrl(path)
      uploadedUrls.push(publicData.publicUrl)
    }

    setImages((current) => [...current, ...uploadedUrls])
    setUploading(false)
    event.target.value = ''
  }

  function removeImage(index) {
    setImages((current) => current.filter((_, i) => i !== index))
  }

  function handleDragStart(index) {
    dragIndexRef.current = index
  }

  function handleDragOver(event) {
    event.preventDefault()
  }

  function handleDrop(index) {
    const fromIndex = dragIndexRef.current
    dragIndexRef.current = null
    if (fromIndex === null || fromIndex === index) return

    setImages((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Product name is required.')
      return
    }
    if (price === '' || Number.isNaN(Number(price))) {
      setError('A valid price is required.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: name.trim(),
      price: Number(price),
      original_price: originalPrice === '' ? null : Number(originalPrice),
      category,
      sizes,
      images,
      image: images[0] || null,
      description: description.trim() || null,
      fabric: fabric.trim() || null,
      fit: fit.trim() || null,
      care_instructions: careInstructions.trim() || null,
      measurements: measurements.trim() || null,
    }

    if (mode === 'edit') {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id)

      setSaving(false)

      if (updateError) {
        setError(`Couldn't save changes: ${updateError.message}`)
        return
      }

      showToast('Product updated')
      startNav()
      router.push('/admin/products')
      router.refresh()
      return
    }

    // Create — try the plain slug first, then retry once with a short
    // random suffix if it's already taken.
    const baseSlug = slugify(name)
    let insertError = await supabase
      .from('products')
      .insert({ ...payload, slug: baseSlug })
      .select()
      .single()
      .then((res) => res.error)

    if (insertError?.code === '23505') {
      insertError = await supabase
        .from('products')
        .insert({ ...payload, slug: `${baseSlug}-${randomSuffix()}` })
        .select()
        .single()
        .then((res) => res.error)
    }

    setSaving(false)

    if (insertError) {
      setError(`Couldn't create product: ${insertError.message}`)
      return
    }

    showToast('Product added')
    startNav()
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">Product name</label>
        <input
          id="name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Adaeze wrap dress"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">Price (₦)</label>
          <input
            id="price"
            type="number"
            min="0"
            className={styles.input}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="45000"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="originalPrice">Original price (optional)</label>
          <input
            id="originalPrice"
            type="number"
            min="0"
            className={styles.input}
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="60000"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="category">Category</label>
        <select
          id="category"
          className={styles.input}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryList.map((cat) => (
            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        {!showAddCategory ? (
          <button
            type="button"
            className={styles.addCategoryLink}
            onClick={() => setShowAddCategory(true)}
          >
            + Add new category
          </button>
        ) : (
          <div className={styles.addCategoryRow}>
            <input
              type="text"
              className={styles.addCategoryInput}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
            />
            <button
              type="button"
              className={styles.addCategoryBtn}
              onClick={handleAddCategory}
              disabled={addingCategory}
            >
              {addingCategory ? 'Adding…' : 'Add'}
            </button>
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Sizes</label>
        <div className={styles.pillRow}>
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              className={`${styles.pill} ${sizes.includes(size) ? styles.pillActive : ''}`}
              onClick={() => toggleSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Images (drag to reorder — first is the cover)</label>
        <div className={styles.imageRow}>
          {images.map((url, index) => (
            <div
              key={url}
              className={styles.imageThumb}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              <img src={url} alt="" className={styles.imageThumbImg} />
              {index === 0 && <span className={styles.coverBadge}>Cover</span>}
              <button
                type="button"
                className={styles.imageRemoveBtn}
                onClick={() => removeImage(index)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.imageAddBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '…' : '+'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFilesSelected}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Flowing crepe wrap dress with an adjustable tie waist..."
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fabric">Fabric (optional)</label>
          <input
            id="fabric"
            type="text"
            className={styles.input}
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            placeholder="100% silk crepe"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fit">Fit (optional)</label>
          <input
            id="fit"
            type="text"
            className={styles.input}
            value={fit}
            onChange={(e) => setFit(e.target.value)}
            placeholder="True to size, relaxed through the waist"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="careInstructions">Care instructions (optional)</label>
        <textarea
          id="careInstructions"
          rows={3}
          className={styles.textarea}
          value={careInstructions}
          onChange={(e) => setCareInstructions(e.target.value)}
          placeholder="Dry clean only. Store on a padded hanger."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="measurements">Measurements (optional)</label>
        <textarea
          id="measurements"
          rows={3}
          className={styles.textarea}
          value={measurements}
          onChange={(e) => setMeasurements(e.target.value)}
          placeholder="Bust 92cm, Waist 74cm, Length 118cm (Size M)"
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.saveBtn} disabled={saving || uploading}>
          {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Save product'}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => { startNav(); router.push('/admin/products') }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}