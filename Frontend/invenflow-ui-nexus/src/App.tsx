import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Supplier from "./pages/Supplier";
//import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import UserSettings from "./pages/UserSettings";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import Inventory from "./pages/Inventory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/suppliers" element={<Supplier />} />
          <Route path="/customers" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
