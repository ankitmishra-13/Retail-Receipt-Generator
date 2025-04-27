"use client";

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectItem, SelectContent } from '@/components/ui/select';
import Barcode from 'react-barcode';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function AutoZoneReceiptForm() {
  const [form, setForm] = useState({
    storeName: 'AutoZone 4129',
    storeAddress: '2413 W. SEVENTEENTH\nSANTA ANA, CA',
    phone: '(714) 554-1195',
    logo: '',
    items: [
      { code: '#370965', desc: '611-117, 2 @ 1/3.99', price: 7.98, taxType: 'P' },
      { code: '611-117', desc: 'Dorman M12-1.50 21m Hex WH Nut, EA', price: 0, taxType: 'P' }
    ],
    cashPaid: 10.0,
    registerInfo: 'REG #01, CSR #08, RECEIPT #168930',
    transactionNumber: '#862071',
    storeNumber: '#4129',
    date: '2014-11-13',
    time: '09:49',
    barcode: '#412986207114113',
    promoMessage: 'You Could Be Earning $20...',
    surveyInstructions: 'Take a survey for a chance to win $10000 at www.autozonecares.com',
    referenceNumber: '4129-862071-141113-1'
  });

  const receiptRef = useRef(null);

  const updateItem = (index, field, value) => {
    const updated = [...form.items];
    updated[index][field] = field === 'price' ? parseFloat(value) : value;
    setForm({ ...form, items: updated });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { code: '', desc: '', price: 0, taxType: 'P' }] });
  };

  const clearReceipt = () => {
    setForm({
      ...form,
      items: [],
      cashPaid: 0,
    });
  };

  const removeItem = (index) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const updateField = (field, value) => {
    if (field === 'cashPaid') {
      const newVal = parseFloat(value);
      setForm({ ...form, [field]: isNaN(newVal) ? 0 : newVal });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const subtotal = form.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const change = +(form.cashPaid - total).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('autozone-receipt.pdf');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-red-600 via-white to-blue-600 print:block print:p-0 print:m-0 print:bg-white">
      {/* Form Side */}
      <div className="space-y-4 print:hidden">
        <h2 className="text-xl font-bold text-white drop-shadow">Autozone Retail Receipt</h2>

        <div className="border p-4 rounded-md shadow-lg bg-white/80">
          <Label>Store Name (Fixed)</Label>
          <Input value={form.storeName} readOnly className="bg-gray-200" />

          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />

          <Label>Time</Label>
          <Input type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} />

          <Label>Upload Logo</Label>
          <div className="relative border border-dashed border-gray-400 h-20 flex items-center justify-center text-gray-500 bg-gray-100 mb-2">
            {form.logo ? (
              <>
                <img src={form.logo} alt="Logo" className="h-full object-contain" />
                <button
                  onClick={() => updateField('logo', '')}
                  className="absolute top-1 right-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded"
                >
                  Remove
                </button>
              </>
            ) : (
              <span>Upload your logo</span>
            )}
            <Input
              type="file"
              accept="image/*"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => updateField('logo', URL.createObjectURL(e.target.files[0]))}
            />
          </div>

          <Label>Store Address</Label>
          <Textarea value={form.storeAddress} onChange={(e) => updateField('storeAddress', e.target.value)} />

          {form.items.map((item, index) => (
            <div key={index} className="bg-gray-100 p-2 rounded shadow space-y-1">
              <Label>Item Code</Label>
              <Input value={item.code} onChange={(e) => updateItem(index, 'code', e.target.value)} />
              <Label>Description</Label>
              <Input value={item.desc} onChange={(e) => updateItem(index, 'desc', e.target.value)} />
              <Label>Price</Label>
              <Input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
              <Label>Tax Type</Label>
              <Select value={item.taxType} onValueChange={(value) => updateItem(index, 'taxType', value)}>
                <SelectTrigger>{item.taxType}</SelectTrigger>
                <SelectContent>
                  <SelectItem value="P">P</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" className="text-red-500 text-xs" onClick={() => removeItem(index)}>Remove Item</Button>
            </div>
          ))}

          <div className="flex space-x-2">
            <Button variant="secondary" onClick={addItem} className="bg-black text-white">Add Item</Button>
            <Button variant="secondary" onClick={clearReceipt} className="bg-black text-white">Clear Receipt</Button>
          </div>

          <div className="mt-4">
            <Label>Cash Paid</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              pattern="[0-9]*"
              value={form.cashPaid === 0 ? '' : form.cashPaid}
              placeholder="Enter amount"
              onChange={(e) => updateField('cashPaid', e.target.value)}
            />
          </div>

          <div className="mt-2">
            <Label>Change</Label>
            <Input type="text" value={change.toFixed(2)} readOnly className="bg-gray-100" />
          </div>

          <Label>Promotional Message</Label>
          <Textarea value={form.promoMessage} onChange={(e) => updateField('promoMessage', e.target.value)} />

          <Label>Survey Instructions</Label>
          <Textarea value={form.surveyInstructions} onChange={(e) => updateField('surveyInstructions', e.target.value)} />

          <Label>Reference Number</Label>
          <Input value={form.referenceNumber} onChange={(e) => updateField('referenceNumber', e.target.value)} />
        </div>

        <div className="flex space-x-2">
          <Button onClick={handlePrint}>Print Receipt</Button>
          <Button onClick={handleDownload} variant="outline">Download Receipt</Button>
        </div>
      </div>

      {/* Receipt Preview */}
      <Card className="border border-gray-300 bg-white shadow-xl print:shadow-none print:border-none print:w-full print:!block" ref={receiptRef}>
        <CardContent className="font-mono text-sm text-center p-4 space-y-1 print:p-2 print:w-full print:mx-auto">
          {form.logo && <img src={form.logo} alt="Logo" className="h-16 mx-auto mb-2" />}

          <div className="whitespace-pre">
            {form.storeName}
            {'\n'}{form.storeAddress}
            {'\n'}{form.phone}

            {form.items.map((item, i) => (
              <div key={i}>
                {item.code} {item.desc}{'\n'}{item.taxType} {item.price.toFixed(2)}
              </div>
            ))}

            {'\n'}SUBTOTAL     {subtotal.toFixed(2)}
            {'\n'}TOTAL TAX    {tax.toFixed(2)}
            {'\n'}TOTAL        {total.toFixed(2)}
            {'\n'}CASH         {form.cashPaid.toFixed(2)}
            {'\n'}CHANGE       {change.toFixed(2)}

            {'\n'}{form.registerInfo}
            {'\n'}STR TRANS {form.transactionNumber}
            {'\n'}STORE {form.storeNumber}
            {'\n'}DATE {form.date} {form.time}
            {'\n'}# OF ITEMS SOLD {form.items.length}

            <div className="my-4 flex flex-col items-center">
              <Barcode value={form.barcode.replace(/[^\d]/g, '')} height={60} width={1.5} displayValue={false} />
              <div>#{form.barcode.replace(/[^\d]/g, '')}</div>
            </div>

            <div className="font-bold">{form.promoMessage}</div>
            <div>{form.surveyInstructions}</div>
            <div className="mt-2">Ref No. {form.referenceNumber}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
