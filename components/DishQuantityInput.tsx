"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";

interface Dish {
  name: string;
  quantity: number | string;
}

interface DishQuantityInputProps {
  value: string; // JSON string
  onChange: (value: string) => void;
}

export default function DishQuantityInput({ value, onChange }: DishQuantityInputProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || "[]");
      if (Array.isArray(parsed)) {
        setDishes(parsed);
      } else {
        // Handle object format {"Dish": 10}
        const converted = Object.entries(parsed).map(([name, quantity]) => ({
          name,
          quantity: quantity as number
        }));
        setDishes(converted);
      }
    } catch (e) {
      setDishes([]);
    }
  }, [value]);

  const updateDishes = (newDishes: Dish[]) => {
    setDishes(newDishes);
    const result: Record<string, number> = {};
    newDishes.forEach(d => {
      if (d.name) result[d.name] = Number(d.quantity) || 0;
    });
    onChange(JSON.stringify(result));
  };

  const addDish = () => {
    updateDishes([...dishes, { name: "", quantity: "" }]);
  };

  const removeDish = (index: number) => {
    updateDishes(dishes.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Dish, val: string) => {
    const newDishes = [...dishes];
    newDishes[index] = { ...newDishes[index], [field]: val };
    updateDishes(newDishes);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết món & Số lượng (In nhãn)</label>
        <button
          type="button"
          onClick={addDish}
          className="text-xs font-bold text-indigo-600 flex items-center hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3 mr-1" /> Thêm món
        </button>
      </div>

      <div className="space-y-2">
        {dishes.length === 0 && (
          <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl text-center text-slate-400 text-xs">
            Chưa có chi tiết món nào. Nhấn để thêm.
          </div>
        )}
        {dishes.map((dish, index) => (
          <div key={index} className="flex items-center space-x-2 animate-in slide-in-from-left-2 duration-200">
            <div className="flex-1 relative">
              <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                value={dish.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                placeholder="Tên món"
                className="w-full pl-8 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                value={dish.quantity}
                onChange={(e) => handleChange(index, "quantity", e.target.value)}
                placeholder="SL"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => removeDish(index)}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
