"use client";

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectItem, SelectContent } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import Barcode from 'react-barcode';

export default function AutoZoneReceiptForm() {
  const [form, setForm] = useState({
    storeName: 'AutoZone 4129',
    storeAddress: '2413 W.SEVENTEENTH\nSANTA ANA, CA',
    phone: '(714) 554-1195',
    logo: '',
    items: [
      { code: '#370965', desc: '611-117.1 \n 2 @ 1/3.99', price: 7.98, taxType: 'P' },
      { code: '611-117.1', desc: 'Dorman\n M12-1.50 21m Hex WH Nut, EA', price: 0, taxType: 'P' }
    ],
    cashPaid: '10.00',
    registerInfo: 'REG #01  CSR #08  RECEIPT #168930',
    transactionNumber: '#862071',
    storeNumber: '#4129',
    date: '11/13/2014',
    time: '09:49',
    barcode: '*4129862071111314*',
    '# Of Items Sold': '2',
    promoMessage: 'You Could Be Earning $20 With this purchase. Ask An Autozoner About AutoZone Rewards Or Visit AutoZonerewards.com.',
    surveyInstructions: 'Take a survey for a chance to win $10000',
    referenceNumber: '4129-862071-141113-1',
    termsAccepted: false
  });

  const receiptRef = useRef(null);

  const updateItem = (index: number, field: string, value: any) => {
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
      cashPaid: '',
      logo: '',
    });
  };

  const removeItem = (index: number) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const updateField = (field: string, value: any) => {
    if (field === 'cashPaid') {
      const newVal = parseFloat(value);
      setForm({ ...form, [field]: isNaN(newVal) ? '' : newVal });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const subtotal = form.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const change = form.cashPaid ? +(parseFloat(form.cashPaid) - total).toFixed(2) : 0;

  const handlePrint = () => {
    if (form.termsAccepted) {
      if (!receiptRef.current) {
        alert("Receipt content is not available.");
        return;
      }
      const printContents = (receiptRef.current as HTMLDivElement).innerHTML;
      const printWindow = window.open('', '', 'width=600,height=800');
      printWindow!.document.write(`
        <html>
          <head>
            <title>Print Receipt</title>
            <style>
              body {
                font-family: monospace;
                padding: 20px;
                background: white;
                color: black;
              }
              .receipt {
                max-width: 450px;
                margin: auto;
                border: 1px solid #ccc;
                padding: 10px;
                font-size: 14px;
              }
              img {
                max-height: 80px;
                display: block;
                margin: 0 auto 10px;
              }
              .flex { display: flex; justify-content: space-between; }
              .text-center { text-align: center; }
              .mt-2 { margin-top: 0.5rem; }
              .mt-4 { margin-top: 1rem; }
              .border-b { border-bottom: 1px solid #ddd; }
              .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <div class="receipt">
              ${printContents}
            </div>
          </body>
        </html>
      `);
      printWindow!.document.close();
      printWindow!.print();
    } else {
      alert("Please accept the Terms and Conditions before printing.");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background text-foreground dark:bg-black dark:text-white">
      
      {/* Left Form Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-left align mb-4">AutoZone Retail Receipt</h1>
        <div className="border p-4 rounded-md shadow bg-white dark:bg-gray-900">
          <Label>Store Name (Fixed)</Label>
          <Input value={form.storeName} readOnly className="bg-gray-200 dark:bg-gray-800" />
          <Label>Upload Logo</Label>
          <div className="relative border border-dashed h-16 flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-2 hover:bg-gray-200 dark:hover:bg-gray-700">
            {form.logo ? (
              <>
                <img src={form.logo} alt="Logo" className="h-full object-contain" />
                <Button size="icon" variant="ghost" className="text-red-500 absolute top-1 right-1 hover:bg-red-200 dark:hover:bg-red-100 cursor-pointer" onClick={() => updateField('logo', '')}>
                  <Trash2 size={16} />
                </Button>
              </>
            ) : (
              <span className="text-sm p-10">Choose File</span>
            )}
            <Input
              type="file"
              accept="image/*"
              className="absolute top-5 left-0 w-0 h-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.type.startsWith('image/')) {
                  updateField('logo', URL.createObjectURL(file));
                } else {
                  console.error("Selected file is not an image");
                }
              }}
            />
          </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
          <div>
          <Label>Date</Label> 
          <Input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
          </div>
          <div>   
          <Label>Time</Label>
          <Input type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} />
          </div>       
          </div>

          <Label>Store Address</Label>
          <Textarea value={form.storeAddress} onChange={(e) => updateField('storeAddress', e.target.value)} />
          <div className="whitespace-pre-line"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              updateField('storeAddress', form.storeAddress + '\n');
            }
          }}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={addItem} className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">+</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
          {form.items.map((item, index) => (
            <div key={index} className="relative bg-gray-100 dark:bg-gray-800 p-2 rounded shadow mt-2">
              <Button size="icon" variant="ghost" className="text-red-500 absolute top-1 right-1 hover:bg-red-200 dark:hover:bg-red-100 cursor-pointer" onClick={() => removeItem(index)}>
                <Trash2 size={16} />
              </Button>
              <Label>Item Code</Label>
              <Input value={item.code} onChange={(e) => updateItem(index, 'code', e.target.value)} />
              <Label>Description</Label>
              <Input value={item.desc} onChange={(e) => updateItem(index, 'desc', e.target.value)} />
              <div className="whitespace-pre-line" onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              updateField('Description', item.desc + '\n');
            }
          }
          }/>
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
            </div>
          ))}
          
          </div>
          
          <div className="grid grid-cols-2 gap-2">
          <div> 
          <Label>Register Info</Label>
          <Input value={form.registerInfo} onChange={(e) => updateField('registerInfo', e.target.value)} />
          <Label>Transaction Number</Label>
          <Input value={form.transactionNumber} onChange={(e) => updateField('transactionNumber', e.target.value)} />
          </div>
          <div>
          <Label>Store Number</Label>
          <Input value={form.storeNumber} onChange={(e) => updateField('storeNumber', e.target.value)} />
          <Label>Barcode</Label>
          <Input value={form.barcode} onChange={(e) => updateField('barcode', e.target.value)} />
          </div>
          <div>
          <Label># Of Items Sold</Label>1
          <Input value={form.items.length} readOnly className="bg-gray-200 dark:bg-gray-800" />
          </div>
          <div>
            <Label>Change</Label>
            <Input type="text" value={change.toFixed(2)} readOnly className="bg-gray-200 dark:bg-gray-700" />
          </div>
          </div>
          <div className="mt-4">
            <Label>Cash Paid</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.cashPaid}
              placeholder="Enter amount"
              onChange={(e) => updateField('cashPaid', e.target.value)}
            />
          </div>

          <Label>Promotional Message</Label>
          <Textarea value={form.promoMessage} onChange={(e) => updateField('promoMessage', e.target.value)} />

          <Label>Survey Instructions</Label>
          <Textarea value={form.surveyInstructions} onChange={(e) => updateField('surveyInstructions', e.target.value)} />

          <Label>Reference Number</Label>
          <Input value={form.referenceNumber} onChange={(e) => updateField('referenceNumber', e.target.value)} />

          <div className="flex items-center space-x-2 mt-4 ">
            <input type="checkbox" checked={form.termsAccepted} onChange={(e) => updateField('termsAccepted', e.target.checked)} className="checkbox cursor-pointer" />
            <Label className="text-xs">Accept Terms and Conditions</Label>
          </div>

          <div className="flex space-x-2 mt-4">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 w-full py-2 text-lg font-semibold uppercase text-white cursor-pointer">
              Create Receipt
            </Button>
            <Button onClick={clearReceipt} className="bg-red-600 hover:bg-red-700 text-lg font-semibold uppercase text-white cursor-pointer">
              CLEAR
            </Button>
          </div>
      </div>

      {/* Right Receipt Section */}
      <div>
        <h1 className="text-2xl font-bold text-left align mb-4">Live Preview</h1>
        <Card className="border bg-white dark:bg-gray-900 shadow-xl scale-[1.0] max-w-[410px] w-full h-[950px] mx-auto overflow-y-auto"ref={receiptRef}>
          <CardContent className="font-mono text-sm text-center p-4">
            {form.logo && <img src={form.logo} alt="Logo" className="h-16 mx-auto mb-2" />}
            <div className="whitespace-pre-line">
              <span className="font-bold text-ms text-center p-4">{form.storeName} </span>
              {'\n'}{form.storeAddress}
              {'\n'}{form.phone}
            </div>

            {form.items.map((item, i) => (
              <div key={i} className="text-left mb-0">
                <div className="text-left">
                  <span>{item.code}</span><span className="whitespace-pre-line ml-2 text-left pr-10">
                  {item.desc}
                </span>
                  {item.price > 0 && (
                    <span className="pl-30">{item.price.toFixed(2)} {item.taxType}</span>
                  )}
                </div>
              </div>
            ))}

            <div className="mt -0 text-right pr-25 font-mono">
              <div>SUBTOTAL <span className="pl-10">{subtotal.toFixed(2)}</span></div>
              <div>TOTAL TAX @ 8.000% <span className="pl-10"> {tax.toFixed(2)}</span></div>
              <div>TOTAL <span className="pl-10">{total.toFixed(2)}</span> </div>
              <div>CASH <span className="pl-10"> {form.cashPaid || '0.00'}</span></div>
              <div>CHANGE <span className="pl-10"> {change.toFixed(2)}</span></div>
            </div>

            <div className="text-left align text-xs">{form.registerInfo}</div>
            <div className="text-left align font-mono font-bold text-sm tracking-widest"><span>STR. TRANS </span><span>{form.transactionNumber}</span></div>
            <div className="text-left align font-mono font-bold text-sm tracking-widest"><span>Store </span><span>{form.storeNumber}</span></div>
            <div className="text-left align font-mono font-bold text-sm tracking-widest"><span>Date </span><span>{form.date}</span><span className="text-xs font-mono"> {form.time}</span></div>

            <div className="text-left align text-sm font-bold"><span># OF ITEMS SOLD </span><span>{form.items.length}</span></div>

            <div className="flex flex-col items-center">
              <Barcode value={form.barcode.replace(/[^\d]/g, '')} height={40} width={2.0} displayValue={false} />
              <div className="tracking-widest text-lg font-mono">*{form.barcode.slice(1,-1)}*</div>
              <div className="tracking-widest text-2xl">**********************</div>
            </div>
            <div className="text-left align text-xs pr-25">{form.promoMessage}</div>
            <div className="tracking-widest text-2xl">**********************</div>
            <div className="text-sm font-bold tracking-widest text-center px-20">{form.surveyInstructions}</div>
            <div className="mt-2 text-xs text center">
            at www.autozonecares.com 
            <br/>or by calling 1-800-598-8943.
            <br/>No purchase necessary. Ends 11/30/14. 
            <br/>Subject to full official rules 
            <br/>at www.autozonecares.com
            </div>
            <div className="whitespace-pre-line">
            <span className="mt-2 font-bold">Ref No :</span>
            <span className="font-bold tracking-widest">{'\n'}{form.referenceNumber}</span>
            </div>
            <div className="whitespace-pre-line">
            <div className="mt-2 text-xs text-center">
             Llena esta encuesta visitando
            <br/>www.autozonecares.com o llamando al 
            <br/>1-800-598-8943 para tener 
            <br/>oportunidad de ganar $10,000.
            <br/>No es necesario efectuar una compra. 
            <br/>Termina el 11/30/14. Sujeto a las 
            <br/>reglas oficiales en el sitio
            <br/>www.autozonecares.com
            </div>
            </div>
            <div className="whitespace-pre-line">
            <span className="mt-2 font-bold"> Ref No :</span>
            <span className="font-bold tracking-widest font-mono">{'\n'}{form.referenceNumber}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
