'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import Barcode from 'react-barcode';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaUpload, FaTrashAlt } from "react-icons/fa";


export default function AutoZoneReceiptForm() {
  interface ReceiptItem {
    code: string;
    desc: string;
    desc2: string;
    price: number;
    taxType: string;
  }

  const [form, setForm] = useState<{
    storeName: string;
    storeAddress: string;
    phone: string;
    logo: string;
    items: ReceiptItem[];
    cashPaid: string;
    registerInfo: string;
    transactionNumber: string;
    storeNumber: string;
    date: string;
    time: string;
    dateFormat: string;
    barcode: string;
    '# Of Items Sold': string;
    promoMessage: string;
    surveyInstructions: string;
    referenceNumber: string;
    termsAccepted: boolean;
  }>({
    storeName: 'AutoZone 4129',
    storeAddress: '2413 W.SEVENTEENTH\nSANTA ANA, CA',
    phone: '(714) 554-1195',
    logo: '',
    items: [
      { code: '#370965', desc: '611-117.1 ',desc2:'2 @ 1/3.99' ,price: 7.98, taxType: 'P' },
      { code: '611-117.1', desc: 'Dorman\nM12-1.50 21mm Hx Whl Nut, EA', desc2: '', price: 0, taxType: 'P' }
    ],
    cashPaid: '10.00',
    registerInfo: 'REG #01  CSR #08  RECEIPT #168930',
    transactionNumber: '#862071',
    storeNumber: '#4129',
    date: '2014-11-13',
    time: '09:49',
    dateFormat: 'MM/DD/YYYY',
    barcode: '*4129862071111314*',
    '# Of Items Sold': '2',
    promoMessage: 'You Could Be Earning $20 With this purchase. Ask An Autozoner About AutoZone Rewards Or Visit AutoZonerewards.com.',
    surveyInstructions: 'Take  a  survey  for  a  chance  to  win  $10000',
    referenceNumber: '4129-862071-141113-1',
    termsAccepted: false
  });

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const receiptRef = useRef(null);
  const receiptContentRef = useRef(null);
  const barcodeRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateItem = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const updated = [...form.items];
    if (field === 'price') {
      updated[index][field] = parseFloat(value as string);
    } else if (field === 'taxType') {
      updated[index][field] = value as string;
    } else if (field === 'code' || field === 'desc' || field === 'desc2') {
      updated[index][field] = value as string;
    }
    setForm({ ...form, items: updated });
  };
  const addItem = () => {
    setForm({ ...form, items: [...form.items, { code: '', desc: '',desc2:'', price: 0, taxType: 'P' }] });
  };

  const clearReceipt = () => {
    setForm({
      ...form,
      items: [],
      cashPaid: '',
    });
    setLogoPreview(null);
  };

  const removeItem = (index: number) => {
    const updated = [...form.items];
    updated.splice(index, 1);
    setForm({ ...form, items: updated });
  };

  const updateField = (field: keyof typeof form, value: any) => {
    if (field === 'cashPaid') {
      const newVal = parseFloat(value);
      setForm({ ...form, [field]: isNaN(newVal) ? '' : newVal.toString() });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch(form.dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${month}/${day}/${year}`;
    }
  };

  const subtotal = form.items.reduce((sum, item) => sum + (item.price || 0), 0);
  const taxableSubtotal = form.items.reduce((sum, item) => sum + ((item.taxType === 'P' ? item.price : 0) || 0), 0);
  const tax = +(taxableSubtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);
  const change = form.cashPaid ? +(parseFloat(form.cashPaid) - total).toFixed(2) : 0;

  const zoomIn = () => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 1.5));
  };

  const zoomOut = () => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setLogoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Please upload a valid image file.");
    }
  };

  const handleClearLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadPDF = async () => {
    if (!form.termsAccepted) {
      alert("Please accept the Terms and Conditions before downloading.");
      return;
    }

    if (!receiptRef.current) {
      alert("Receipt content is not available.");
      return;
    }

    // Set zoom level to 1 for capturing
    const originalZoom = zoomLevel;
    setZoomLevel(1.0);
    
    // Wait for the state update to apply
    setTimeout(async () => {
      try {
        const receiptElement = receiptContentRef.current;
        if (!receiptElement) {
          alert("Receipt content is not available.");
          setZoomLevel(originalZoom);
          return;
        }
        
        // Use html2canvas to capture the receipt with exact styling
        const canvas = await html2canvas(receiptElement, {
          scale: 1, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: 'white'
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with the same styling as the receipt preview
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [canvas.width/4, canvas.height/4], // Scale down the canvas size to fit on PDF
        });
        
        // Add the captured image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        
        // Save the PDF
        pdf.save(`autozone-receipt-${new Date().toISOString().slice(0, 10)}.pdf`);
        
        // Restore zoom level
        setZoomLevel(originalZoom);
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please try again.");
        setZoomLevel(originalZoom);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background text-foreground dark:bg-black dark:text-white">
      {/* Left Form Section */}
      <div className="space-y-4">
        <h1 className="text-2xl text-left align mb-4">AutoZone Retail Receipt</h1>
        <div className="border p-4 rounded-md shadow bg-white dark:bg-gray-900">
          <Label>Store Name</Label>
          <Input value={form.storeName}
          type="text"
            onChange={(e) => updateField('storeName', e.target.value)}
            placeholder="Enter store name"
            className="mb-2"
            suppressHydrationWarning />
          {/* Improved Logo Upload Section */}
          <div className="mt-2">
            <Label className="block mb-2">Upload Logo</Label>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full">
              <label
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition w-full md:w-3/4"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                  ref={fileInputRef}
                />
                <span className="text-gray-700 flex-1 truncate">
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </span>
                <FaUpload className="text-gray-600" />
              </label>
              
                <button
                  type="button"
                  disabled={!logoPreview}
                  onClick={handleClearLogo}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition flex items-center gap-2 hover:shadow-lg hover:scale-110 cursor-pointer"
                  title="Remove Logo"
                >
                  <FaTrashAlt />
                </button>
            
            </div>
          </div>
        </div>
          
        <div className="grid grid-cols-3 gap-2">
          <span>
            <Label htmlFor='date'>Date</Label>
            <Input
              id="date"
              type="date"
              className="w-40 hover:bg-gray-100 cursor-pointer"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              suppressHydrationWarning />
              </span>
              <span>
              <Label>Date Format</Label>
              <br/>
              <Select value={form.dateFormat} onValueChange={(value) => updateField('dateFormat', value)}>
                <SelectTrigger className="w-40 hover:bg-gray-100 cursor-pointer" suppressHydrationWarning>
                  <SelectValue placeholder={form.dateFormat} />
                </SelectTrigger>
                <SelectContent className="w-40 bg-white dark:bg-gray-800">
                  <SelectItem className="hover:bg-gray-200 cursor-pointer" value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem className="hover:bg-gray-200 cursor-pointer" value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem className="hover:bg-gray-200 cursor-pointer" value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </span>
            <span>   
            <Label>Time</Label>
            <Input className="w-40 hover:bg-gray-100 cursor-pointer" type="time" value={form.time} onChange={(e) => updateField('time', e.target.value)} suppressHydrationWarning />
          </span>       
        </div>

        <Label>Store Address</Label>
        <Textarea 
          value={form.storeAddress} 
          onChange={(e) => updateField('storeAddress', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              updateField('storeAddress', form.storeAddress + '\n');
            }
          }}
        />
        
        <Label>Phone Number</Label>
        <Input 
          value={form.phone} 
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="(XXX) XXX-XXXX"
        />
        
        <Label className="font-bold">Receipt Items</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {form.items.map((item, index) => (
            <div key={index} className="relative bg-gray-100 dark:bg-gray-800 p-2 rounded shadow mt-2">
              <div className="absolute top-1 right-1">
                <button
                  suppressHydrationWarning
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:text-red-600 rounded-full transition flex items-center justify-center hover:scale-110 cursor-pointer"
                  title="Remove Item"
                  type="button"
                >
                  <FaTrashAlt />
                </button>
              </div>
              <Label>Item Code</Label>
              <Input 
                placeholder="Enter item code"
               value={item.code} onChange={(e) => updateItem(index, 'code', e.target.value)} />
              <Label>Description</Label>
              <Input
                type="text"

                className="resize-none"
                placeholder="Enter item description" 
                value={item.desc} 
                onChange={(e) => updateItem(index, 'desc', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    updateItem(index, 'desc', item.desc + '\n');
                  }
                }}
               />
               <Label>Description 2</Label>
              <Input
                type="text"
                className="resize-none"
                placeholder="Enter second description line" 
                value={item.desc2} 
                onChange={(e) => updateItem(index, 'desc2', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    updateItem(index, 'desc2', item.desc2 + '\n');
                  }
                }}
               />
              <Label>Price</Label>
              <Input
               type="number"
                min="0"
                step="0.01"
                placeholder="Enter item price"
                value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
              <Label>Tax Type</Label>
              <Select value={item.taxType} onValueChange={(value) => updateItem(index, 'taxType', value)}>
                <SelectTrigger className="w-40 hover:bg-gray-100 cursor-pointer">
                  <SelectValue placeholder={item.taxType} />
                </SelectTrigger>
                <SelectContent className=" bg-white dark:bg-gray-800 cursor-pointer">
                  <SelectItem className="hover:bg-gray-200 cursor-pointer" value="P">P</SelectItem>
                  <SelectItem className="hover:bg-gray-200 cursor-pointer" value="N">N</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-1 flex items-center justify-end">
          <Button onClick={addItem} className="rounded-md bg-green-600 hover:bg-green-700 text-white cursor-pointer">+</Button>
        </div>
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
            <Label># Of Items Sold</Label>
            <Input value={form.items.length} readOnly className="bg-gray-200 dark:bg-gray-800" suppressHydrationWarning />
          </div>
          <div>
            <Label>Change</Label>
            <Input type="text" value={change.toFixed(2)} readOnly className="bg-gray-200 dark:bg-gray-700" suppressHydrationWarning />
          </div>
        </div>
        
        <div>
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
          <input 
            type="checkbox" 
            id="termsAccepted"
            checked={form.termsAccepted} 
            onChange={(e) => updateField('termsAccepted', e.target.checked)} 
            className="checkbox cursor-pointer" 
          />
          <Label htmlFor="termsAccepted" className="text-xs">Accept Terms and Conditions</Label>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button 
            onClick={downloadPDF} 
            className="bg-blue-600 hover:bg-blue-700 w-full py-2 text-lg font-semibold uppercase text-white cursor-pointer flex items-center justify-center gap-2"
            disabled={!form.termsAccepted}
          >
            <Download size={18} />
            CREATE RECEIPT
          </Button>
          <Button 
            onClick={clearReceipt} 
            className="bg-red-600 hover:bg-red-700 text-lg font-semibold uppercase text-white cursor-pointer"
          >
            CLEAR
          </Button>
        </div>
      </div>

      {/* Right Receipt Section */}
      <div>
        <h1 className="text-2xl text-left align mb-1">Live Preview</h1>
        
        {/* Zoom controls */}
        <div className="mb-2 text-right pr-40 font-mono">
          <Button
            onClick={zoomIn}
            className="w-8 h-8 bg-gray-900 text-white rounded-full hover:bg-purple-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <span className="text-2xl">+</span>
          </Button>
          <Button 
            onClick={zoomOut} 
            className="mx-2 text-white rounded-full w-8 h-8 bg-gray-900 hover:bg-purple-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <span className="text-2xl">-</span>
          </Button>
        </div>
        
        <Card 
          className="bg-white dark:bg-gray-900 shadow-xl max-w-[400px] w-full mx-auto rounded-lg overflow-hidden"
          ref={receiptRef}
        >
          <div 
            className="font-mono text-sm text-center p-4" 
            ref={receiptContentRef}
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease',
              lineHeight: '1.1', // Reduced line spacing
              letterSpacing: '-0.02em' // Slightly tighter character spacing
            }}>
            {/* Display the logo in the receipt preview */}
            {logoPreview && (
              <div className="mb-1 flex justify-center">
                <img src={logoPreview} alt="Store Logo" className="h-16 max-w-full object-contain" />
              </div>
            )}
            
            <div className="whitespace-pre-line pr-14" style={{ marginBottom: '-4px',lineHeight: '1.1' }}>
              <span className="tracking-widest font-bold font-mono text-xl text-center pr-2" style={{lineHeight:'1.1px'}}>{form.storeName}</span>
              <br />{form.storeAddress}
              <br />{form.phone}
            </div>

            {/* Modified item display section to ensure price stays at the right side */}
            {form.items.map((item, i) => (
              <div key={i} className="mt-1 text-left" style={{ lineHeight: '1.1' }}>
                <div className="flex flex-col w-full">
                  {/* Display desc2 at the beginning if it exists */}
                  {item.desc2 && (
                    <div className="text-sm text-center pl-10">
                      {item.desc2}
                    </div>
                  )}
                  
                  {/* Display item code, description, and price in a flex container */}
                  <div className="flex justify-between w-full">
                    <div className="flex-1" style={{ marginLeft: i === 1 ? '10px' : '0' }}>
                      <span>{item.code}</span>
                      <span className="whitespace-pre-line" style={{ marginLeft: i === 1 ? '8px' : '25px', lineHeight: '1.1' }}>
                        {item.desc}
                      </span>
                    </div>
                    
                    {/* Price and tax type always at the right */}
                    {item.price > 0 && (
                      <div className="text-right whitespace-nowrap pr-13">
                        {item.price.toFixed(2)} {item.taxType}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="font-mono pl-6" style={{ lineHeight: '1.1' }}>
              <div className="flex justify-between items-right">
              <span className="flex-1 text-right">SUBTOTAL</span>
              <span className="flex-1 text-center">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-right">
              <span className="flex-1 text-right">TOTAL TAX @ 8.000%</span>
              <span className="flex-1 text-center">{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-right">
              <span className="flex-1 text-right">TOTAL</span>
              <span className="flex-1 text-center">{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-right">
              <span className="flex-1 text-right">CASH</span>
              <span className="flex-1 text-center">{form.cashPaid || '0.00'}</span>
              </div>
              <div className="flex justify-between items-right">
              <span className="flex-1 text-right">CHANGE</span>
              <span className="flex-1 text-center">{change.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-(4) mt-1" style={{ lineHeight: '1' }}>
              <div className="text-left align text-xs" style={{ marginBottom: '-4px' }}>{form.registerInfo}</div>
              <div className="text-left align font-mono font-bold text-base tracking-widest" style={{ marginBottom: '-8px' }}><span>STR. TRANS </span><span>{form.transactionNumber}</span></div>
              <div className="text-left align font-mono font-bold text-base tracking-widest"style={{ marginBottom: '-8px' }}><span>STORE </span><span>{form.storeNumber}</span></div>
              <div className="text-left align font-mono font-bold text-base tracking-widest">
                <span>DATE </span>
                <span>{formatDate(form.date)}</span>
                <span className="text-xs font-mono"> {form.time}</span>
              </div>
              <div className="text-left align text-base font-bold tacking-widest"style={{ marginTop:'-4px' }}><span># OF ITEMS SOLD </span><span>{form.items.length}</span></div>
            </div>

            {/* Improved barcode display */}
            <div className="flex flex-col items-center mt-1">
              <div ref={barcodeRef} >
                <Barcode 
                  value={form.barcode.replace(/[*]/g, '')} 
                  height={40} 
                  width={1.2}
                  format='CODE39'
                  displayValue={false}
                  margin={0}
                  background="#FFFFFF"
                />
              </div>
              <div className="tracking-widest text-2xl "style={{ marginTop: '-6px' }}>{form.barcode}</div>
              <div className="tracking-widest text-2xl"style={{ margin: '-8px' }}>**********************</div>
            </div>
            <div className="text-left align text-xs pr-30" style={{marginTop: '-4px', marginBottom: '-6px', lineHeight: '1.1' }}>{form.promoMessage}</div>
            <div className="tracking-widest text-2xl">**********************</div>
            <div className="text-2xl font-bold tracking-widest px-2" style={{marginTop:'-4px', lineHeight:'1.1', fontFamily: 'Courier New, monospace'}}>{form.surveyInstructions}</div>
            <div className="text-xs text-center pr-5" style={{marginTop:'1px',lineHeight: '1.1' }}>
              at www.autozonecares.com 
              <br/>or by calling 1-800-598-8943.
              <br/>No purchase necessary. Ends 11/30/14. 
              <br/>Subject to full official rules 
              <br/>at www.autozonecares.com
            </div>
            <div className="whitespace-pre-line text-base"style={{ fontFamily: 'Courier New, monospace' }}>
              <span className="font-bold tracking-wide text-2xl flex justify-center">Ref No:</span>
              <span className="font-bold text-2xl tracking-wide block -mt-3">{form.referenceNumber}</span>
            </div>
            <div className="whitespace-pre-line text-base">
              <div className="mt-1 text-xs text-center" style={{ lineHeight: '1.1' }}>
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
            <div className="mt-2 whitespace-pre-line text-base"style={{ fontFamily: 'Courier New, monospace' }}>
              <span className="font-bold tracking-wide text-2xl flex justify-center">Ref No:</span>
              <span className="font-bold tracking-wide text-2xl block -mt-3">{form.referenceNumber}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
