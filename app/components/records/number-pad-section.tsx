'use client';

import { useState } from 'react';
import { Decimal } from 'decimal.js';

interface NumberPadSectionProps {
  value: number;
  onChange: (value: number) => void;
  onSave: () => Promise<void>;
}

// Constants for special buttons
const CONSTANTS = {
  delete: '删除',
  clear: '清零',
  complete: '完成',
};

export function NumberPadSection({ value, onChange, onSave }: NumberPadSectionProps) {
  const [output, setOutput] = useState(value.toString());

  const handleClickPad = async (e: React.MouseEvent) => {
    const text = (e.target as HTMLElement).textContent;
    if (text === null) return;

    // Save record when "完成" (complete) is clicked
    if (text === CONSTANTS.complete) {
      await onSave();
      onChange(0);
      setOutput('0');
      return;
    }

    // Limit input length to 20 characters
    const result = updateOutput(text, output);
    if (result.length > 20) return;

    // Update display and parent state
    setOutput(result);
    onChange(+result);
  };

  return (
    <section className="flex flex-col bg-[#9bcabf] p-4">
      <div className="bg-white text-2xl font-bold leading-10 text-right px-4 rounded-lg border-2 border-black">
        {output}
      </div>
      <div 
        className="flex flex-wrap justify-between mt-2" 
        onClick={handleClickPad}
      >
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">1</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">2</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">3</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-base">{CONSTANTS.delete}</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">4</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">5</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">6</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">+</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">7</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">8</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">9</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">-</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">.</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-2xl">0</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-white text-base">{CONSTANTS.clear}</button>
        <button className="w-[22%] h-10 border-2 border-black rounded-lg mt-2 bg-[#f1c21a] text-base">
          {/^-?\d+\.?\d*$/.test(output) ? CONSTANTS.complete : '='}
        </button>
      </div>
    </section>
  );
}

// Helper function to update the output based on button presses
function updateOutput(text: string, output: string): string {
  switch(text) {
    case '0':
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      if(output === '0') {
        return text;
      } else if(/([+-])0$/.test(output)) {
        return output.slice(0, -1) + text;
      } else {
        return output + text;
      }
    case '+':
      if(/\.$/.test(output)) {
        return output + '0' + text;
      } else if(/\D$/.test(output)){
        return output.slice(0, -1) + text;
      } else if(output === '0') {
        return output;
      } else {
        return output + text;
      }
    case '-':
      if(/\.$/.test(output)) {
        return output + '0' + text;
      } else if(/\D$/.test(output)){
        return output.slice(0, -1) + text;
      } else if(output === '0') {
        return '-';
      } else {
        return output + text;
      }
    case '.':
      if(/(\.\d*|\D)$/.test(output)) {
        return output;
      } else {
        return output + '.';
      }
    case CONSTANTS.delete:
      if(output.length > 1) {
        return output.slice(0, -1) || '0';
      } else {
        return '0';
      }
    case CONSTANTS.clear:
      return '0';
    case '=':
      const strArr = output.split(/(\+|-)/);
      const newStrArr = transArray(strArr);
      const total = newStrArr.reduce((sum, cur) => {
        return sum.plus(cur);
      }, new Decimal(0));
      return total.valueOf();
    default:
      return '0';
  }
}

// Helper function to transform the array for calculation
function transArray(strArr: Array<string>): Array<string> {
  strArr.forEach((str, index) => {
    if(str === '') {
      strArr[index] = '0';
    }
  });

  return strArr.reduce((arr: Array<string>, val) => {
    // If the value is a sign or the array is empty, push it
    if(/(\+|-)/.test(val) || arr.length === 0){
      arr.push(val);
    } else {
      // Otherwise, append to the last element
      arr[arr.length-1] = arr[arr.length-1] + val;
    }
    return arr;
  }, []);
} 