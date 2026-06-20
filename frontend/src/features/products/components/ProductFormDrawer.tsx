import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/ui/field'
import { Drawer } from '@/components/ui/drawer'
import { toast } from '@/components/ui/toast'
import {
  MOTOR_TYPES,
  SENSOR_TYPES,
  useCrmStore,
  type MotorType,
  type Product,
  type SensorType,
} from '@/data'

interface Props {
  open: boolean
  onClose: () => void
  product?: Product
}

type FormState = Omit<Product, 'id' | 'createdAt'>

export function ProductFormDrawer({ open, onClose, product }: Props) {
  const addProduct = useCrmStore((s) => s.addProduct)
  const updateProduct = useCrmStore((s) => s.updateProduct)
  const [form, setForm] = useState<FormState>(
    product ?? {
      sku: '', modelName: '', motorType: 'BLDC Indoor', voltage: 240, wattage: 75,
      poles: 8, sensorType: 'Hall', hsnCode: '', sellingPrice: 0, description: '',
    },
  )
  const [error, setError] = useState('')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSave() {
    if (!form.sku.trim() || !form.modelName.trim()) {
      setError('SKU and model name are required')
      return
    }
    if (product) {
      updateProduct(product.id, form)
      toast('Product updated')
    } else {
      addProduct(form)
      toast('Product added')
    }
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={product ? 'Edit Product' : 'New Product (Kryon SKU)'}
      subtitle="Kryon BLDC controller catalogue entry"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>{product ? 'Save' : 'Add product'}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="SKU / Part Number" required error={error}>
          <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="KRY-BLDC-AC-240" />
        </Field>
        <Field label="Model Name" required>
          <Input value={form.modelName} onChange={(e) => set('modelName', e.target.value)} />
        </Field>
        <Field label="Motor / Controller Type">
          <Select value={form.motorType} onChange={(e) => set('motorType', e.target.value as MotorType)}>
            {MOTOR_TYPES.map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="Sensor Type">
          <Select value={form.sensorType} onChange={(e) => set('sensorType', e.target.value as SensorType)}>
            {SENSOR_TYPES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Voltage (V)">
          <Input type="number" min={0} value={form.voltage} onChange={(e) => set('voltage', Number(e.target.value))} />
        </Field>
        <Field label="Wattage (W)">
          <Input type="number" min={0} value={form.wattage} onChange={(e) => set('wattage', Number(e.target.value))} />
        </Field>
        <Field label="Poles" hint="2–16">
          <Input type="number" min={2} max={16} value={form.poles} onChange={(e) => set('poles', Number(e.target.value))} />
        </Field>
        <Field label="HSN Code" hint="8-digit">
          <Input value={form.hsnCode} onChange={(e) => set('hsnCode', e.target.value)} placeholder="85011090" />
        </Field>
        <Field label="Current Selling Price (₹)" className="sm:col-span-2">
          <Input type="number" min={0} value={form.sellingPrice} onChange={(e) => set('sellingPrice', Number(e.target.value))} />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field label="Spec Sheet / Drawing" hint="File name — PDF upload wires in with backend" className="sm:col-span-2">
          <Input
            value={form.specSheetFileName ?? ''}
            onChange={(e) => set('specSheetFileName', e.target.value)}
            placeholder="KRY-BLDC-AC-240_specsheet.pdf"
          />
        </Field>
      </div>
    </Drawer>
  )
}
