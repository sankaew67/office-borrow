// pages/index.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import {
  FiLogOut,
  FiPackage,
  FiAlertTriangle,
  FiLoader,
  FiInbox,
  FiCheckCircle,
  FiArrowRight,
  FiArrowLeft,
  FiRefreshCw,
  FiImage,
  FiCalendar,
  FiUser,
  FiSearch,
  FiChevronDown,
  FiShield,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiClock,
  FiCheck,
  FiSlash,
  FiPlusCircle, // Added for Add Modal Title
  FiEdit3, // Added for Edit Modal Title
  FiAlertCircle, // Added for Delete Modal Title
  FiInfo, // Added for general info/pending text
} from 'react-icons/fi';
import { toast, Toaster } from 'react-hot-toast';

// --- (Keep existing Type definitions: User, Device, DeviceFilter, SortOrder) ---
type User = {
  id: number | string;
  name: string;
  role?: 'admin' | 'user';
};

type Device = {
  id: number | string;
  name: string;
  type?: string;
  serialNumber?: string;
  status: 'available' | 'borrowed' | 'pending_return';
  borrower?: { id: number | string; name: string };
  imageUrl?: string;
  description?: string;
  dueDate?: string | Date;
};

type DeviceFilter = 'all' | 'available' | 'borrowed-by-me' | 'borrowed-by-others' | 'pending-return';
type SortOrder = 'default' | 'name-asc' | 'name-desc';

// --- (Keep existing Helper function: getErrorMessage) ---
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
    return "An unknown error occurred";
};

// --- (Keep existing Initial state: initialDeviceFormData) ---
const initialDeviceFormData = {
    name: "",
    type: "",
    serialNumber: "",
    description: "",
    imageUrl: "",
};


export default function Home() {
  // --- (Keep existing State declarations: devices, user, loading, etc.) ---
  const [devices, setDevices] = useState<Device[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string | number, boolean>>({});
  const [currentFilter, setCurrentFilter] = useState<DeviceFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const router = useRouter();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deletingDevice, setDeletingDevice] = useState<Device | null>(null);
  const [newDeviceData, setNewDeviceData] = useState(initialDeviceFormData);
  const [editDeviceData, setEditDeviceData] = useState(initialDeviceFormData);
  const [modalLoading, setModalLoading] = useState(false);

  // --- (Keep existing Functions: fetchDevices, handleAction, handleApproveReturn, handleRejectReturn, handleLogout, Admin Actions, etc.) ---
  // --- Fetch Devices ---
  const fetchDevices = useCallback(async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else if (devices.length === 0) setLoading(true);

      try {
          // --- MOCK DATA (Increased to 12 items) ---
          const mockDueDate = (status: Device['status']) => {
              if (status !== 'borrowed' && status !== 'pending_return') return undefined;
              const date = new Date();
              date.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1);
              if (Math.random() < 0.2) { // Simulate some overdue items
                  date.setDate(date.getDate() - (Math.floor(Math.random() * 7) + 15));
              }
              return date.toISOString();
          };
          await new Promise(resolve => setTimeout(resolve, isManualRefresh ? 800 : 1200));

          // Define potential borrowers (excluding admin if logged in as admin)
          const potentialBorrowers = [
              { id: 'user123', name: "Alice Smith" },
              { id: 'user456', name: "Bob Johnson" },
              { id: 'user789', name: "Charlie Brown" },
              // Add the current user only if they are NOT an admin
              ...(user && user.role !== 'admin' ? [{ id: user.id, name: user.name }] : []),
          ];

          // Helper to pick a random borrower (excluding current user if they are admin)
          const getRandomBorrower = () => {
              const availableBorrowers = potentialBorrowers.filter(b => !(user && user.role === 'admin' && b.id === user.id));
              if (availableBorrowers.length === 0) return { id: 'otherUser', name: 'Other User' }; // Fallback
              return availableBorrowers[Math.floor(Math.random() * availableBorrowers.length)];
          };

          let mockApiData: Device[] = [
              { id: 1, name: "Laptop Dell XPS 15", type: "Laptop", serialNumber: "DXPS15-001", status: 'available', imageUrl: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9520/spi/black/ng/notebook-xps-15-9520-black-campaign-hero-504x350-ng.psd?fmt=jpg&wid=570&hei=400", description: "High-performance laptop for demanding tasks and multimedia." },
              { id: 2, name: "MacBook Pro 16 M1", type: "Laptop", serialNumber: "MBP16M1-002", status: 'borrowed', borrower: getRandomBorrower(), imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2C5wp86XHYW1y2Aui3YONZNmI8Z0bW4pKDBLV_-yHgmCTr8duKzamYc4BZ__R6fexCD4&usqp=CAU", description: "Powerful Apple laptop ideal for creative professionals." },
              { id: 3, name: "Logitech MX Master 3S", type: "Mouse", serialNumber: "LMXM3S-003", status: 'available', imageUrl: "https://down-my.img.susercontent.com/file/my-11134207-7qukx-lgfg4oidw0x6f1", description: "Advanced ergonomic wireless mouse with quiet clicks." },
              { id: 4, name: "Monitor LG 27UL850", type: "Monitor", serialNumber: "LG27UL850-004", status: 'available', imageUrl: "https://www.lg.com/content/dam/channel/wcms/au/images/it-monitors/27ul850-w_aau_ehap_au_c/gallery/27L850_W_UHD_4K_Monitor_Z3.jpg", description: "27-inch 4K UHD Monitor with USB-C connectivity." },
              // Item 5: Borrowed by current user (if not admin)
              { id: 5, name: "Keyboard Keychron K2", type: "Keyboard", serialNumber: "KK2-005", status: 'borrowed', borrower: (user && user.role !== 'admin') ? { id: user.id, name: user.name } : getRandomBorrower(), imageUrl: "https://www.keychron.co.th/cdn/shop/files/1-K2-Max-cover.jpg?v=1724743687", description: "Compact 75% layout wireless mechanical keyboard." },
              { id: 6, name: "iPad Pro 11 (M2)", type: "Tablet", serialNumber: "IPP11M2-006", status: 'available', imageUrl: "https://i.ebayimg.com/images/g/uzkAAOSwWOFk8eXC/s-l1200.png", description: "Versatile Apple tablet with M2 chip performance." },
              { id: 7, name: "Projector Epson EB-W06", type: "Projector", serialNumber: "EPSW06-007", status: 'available', imageUrl: "https://www.projectorworld.co.th/wp-content/uploads/2020/10/X06.jpg", description: "Bright and portable WXGA business projector." },
              // Item 8: Pending return by someone else
              { id: 8, name: "Webcam Logitech C920s Pro", type: "Webcam", serialNumber: "LC920S-008", status: 'pending_return', borrower: getRandomBorrower(), imageUrl: "https://www.zoro.com/static/cms/product/large/Discover%20Group%20Inc_LOGITECHxx960000764xx890d3f.jpeg", description: "Full HD 1080p webcam with privacy shutter." },
              // Item 9: Pending return by current user (if not admin)
              { id: 9, name: "Headphones Sony WH-1000XM5", type: "Audio", serialNumber: "SWH1KM5-009", status: 'pending_return', borrower: (user && user.role !== 'admin') ? { id: user.id, name: user.name } : getRandomBorrower(), imageUrl: "https://mercular.s3.ap-southeast-1.amazonaws.com/images/products/2021/04/sony-silent-white-01.jpg", description: "Industry-leading noise-cancelling wireless headphones." },
              // Added items 10, 11, 12
              { id: 10, name: "Samsung T7 Portable SSD 1TB", type: "Storage", serialNumber: "ST7SSD-010", status: 'available', imageUrl: "https://image-us.samsung.com/SamsungUS/home/computing/01242022/MU-PC500T_006_Dynamic-2_Black.jpg?$product-details-jpg$", description: "Fast and durable external solid state drive." },
              { id: 11, name: "Anker PowerConf C300", type: "Webcam", serialNumber: "APCC300-011", status: 'borrowed', borrower: getRandomBorrower(), imageUrl: "https://mightyape.co.ke/public/uploads/all/5mrHkSKxEmAEL0YND67oXKm69n3z7hrFCv0bQCNo.png", description: "Smart AI-powered 1080p webcam for meetings." },
              { id: 12, name: "Wacom Intuos Pro Medium", type: "Drawing Tablet", serialNumber: "WIPM-012", status: 'available', imageUrl: "https://ae01.alicdn.com/kf/H9cbbf94d1c6d4bdea58e4a22a7e70cdcM.jpg_640x640q90.jpg", description: "Professional pen tablet for digital artists and designers." },
          ];

          // Assign due dates and ensure correct borrower for items 5 & 9 based on current user (if not admin)
          mockApiData = mockApiData.map(device => {
              let updatedDevice = { ...device };
              // Assign borrower for item 5 if user is logged in and not admin
              if (device.id === 5 && user && user.role !== 'admin') {
                  updatedDevice.borrower = { id: user.id, name: user.name };
              }
              // Assign borrower for item 9 if user is logged in and not admin
              if (device.id === 9 && user && user.role !== 'admin') {
                  updatedDevice.borrower = { id: user.id, name: user.name };
              }
              // Assign due date if borrowed or pending
              if ((updatedDevice.status === 'borrowed' || updatedDevice.status === 'pending_return') && !updatedDevice.dueDate) {
                  updatedDevice.dueDate = mockDueDate(updatedDevice.status);
              }
              // Ensure no due date if available
              if (updatedDevice.status === 'available') {
                  updatedDevice.dueDate = undefined;
                  updatedDevice.borrower = undefined;
              }
              return updatedDevice;
          });
          // --- END MOCK DATA ---

          setDevices(mockApiData);
      } catch (err: unknown) {
          const errorMessage = getErrorMessage(err) || "Could not load device data";
          console.error("Error fetching devices:", err);
          toast.error(`Error fetching devices: ${errorMessage}`);
      } finally {
          setLoading(false);
          setIsRefreshing(false);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Keep user dependency

  // --- User Auth Effect ---
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { router.push("/login"); return; }
    try {
      const parsedUser: User = JSON.parse(userData);
      // More robust validation
      if (!parsedUser?.id || typeof parsedUser.name !== 'string' || !parsedUser.name.trim() || !parsedUser.role || !['admin', 'user'].includes(parsedUser.role)) {
          throw new Error("Invalid user data structure or missing role");
      }
      setUser(parsedUser);
    } catch (parseError: unknown) {
        console.error("Failed to parse user data:", parseError);
        toast.error("Session invalid. Please log in again.");
        localStorage.removeItem("user");
        router.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // --- Fetch Devices Effect ---
  useEffect(() => {
      if (user) {
          fetchDevices(); // Trigger fetch when user state changes
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-fetch if user changes (e.g., after login)

  // --- Borrow/Return Action Handler ---
  const handleAction = async (action: 'borrow' | 'return', deviceId: number | string) => {
      if (!user) { toast.error("User not identified."); return; }
      const device = devices.find(d => d.id === deviceId);
      if (!device) { toast.error("Device not found."); return; }

      // --- Action Specific Validations ---
      if (action === 'borrow') {
          // Prevent Admin from borrowing
          if (user.role === 'admin') {
              toast.error("Administrators cannot borrow devices.");
              return;
          }
          // Check availability
          if (device.status !== 'available') {
              toast.error("This device is not available to borrow.");
              return;
          }
      } else if (action === 'return') {
          // Check if user is allowed to return
          const isBorrowedByCurrentUser = device.borrower?.id === user.id;
          if (device.status === 'borrowed') {
              if (!isBorrowedByCurrentUser && user.role !== 'admin') {
                  toast.error("You are not the borrower of this device.");
                  return;
              }
          } else if (device.status === 'pending_return') {
              // Only Admin can interact with pending_return items via Approve/Reject buttons
              // Regular users cannot trigger 'return' again if it's already pending
              if (user.role !== 'admin') {
                   toast.error("This device is already pending return approval.");
                   return;
              }
              // Admin should use Approve/Reject, not the 'return' action here.
              // This case shouldn't be reachable if UI is correct, but good to have a check.
              toast.error("Please use Approve/Reject for items pending return.");
              return;

          } else {
              // Cannot return if not borrowed or pending
              toast.error("This device cannot be returned in its current state.");
              return;
          }
      }
      // --- End Validations ---


      setActionLoading(prev => ({ ...prev, [deviceId]: true }));
      let successMessage = '';
      const failureMessage = action === 'borrow' ? 'Borrow action failed' : 'Return action failed';

      try {
          // --- MOCK ACTION LOGIC ---
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (Math.random() < 0.05) { throw new Error("Simulated network error."); }

          setDevices(prevDevices => prevDevices.map(d => {
              if (d.id === deviceId) {
                  if (action === 'borrow') {
                      // This block should only be reached by non-admins due to earlier check
                      successMessage = 'Device borrowed successfully!';
                      const newDueDate = new Date(); newDueDate.setDate(newDueDate.getDate() + 7);
                      return { ...d, status: 'borrowed', borrower: { id: user.id, name: user.name }, dueDate: newDueDate.toISOString() };
                  } else { // Return action (only for 'borrowed' status, triggered by user or admin)
                      if (user.role === 'admin') { // Admin returns instantly (for others)
                           successMessage = 'Device returned successfully! (Admin)';
                           return { ...d, status: 'available', borrower: undefined, dueDate: undefined };
                      } else { // Regular user requests return -> pending
                           successMessage = 'Return requested. Waiting for admin approval.';
                           return { ...d, status: 'pending_return', borrower: d.borrower, dueDate: d.dueDate }; // Keep borrower/due date
                      }
                  }
              }
              return d;
          }));
          // --- END MOCK ACTION LOGIC ---
          toast.success(successMessage);

      } catch (err: unknown) {
          const errorMessage = getErrorMessage(err);
          toast.error(`${failureMessage}: ${errorMessage}`);
          console.error(`${action} error:`, err);
      } finally {
          setActionLoading(prev => { const newState = { ...prev }; delete newState[deviceId]; return newState; });
      }
  };

  // --- Admin: Approve Return Handler ---
  const handleApproveReturn = async (deviceId: number | string) => {
      if (!user || user.role !== 'admin') { toast.error("Permission denied."); return; }
      const device = devices.find(d => d.id === deviceId);
      if (!device || device.status !== 'pending_return') { toast.error("Device not found or not pending return."); return; }

      setActionLoading(prev => ({ ...prev, [deviceId]: true }));
      try {
          await new Promise(resolve => setTimeout(resolve, 1000));
           if (Math.random() < 0.05) { throw new Error("Simulated approval error."); }

          setDevices(prevDevices => prevDevices.map(d =>
              d.id === deviceId ? { ...d, status: 'available', borrower: undefined, dueDate: undefined } : d
          ));
          toast.success(`Return for "${device.name}" approved.`);
      } catch (err: unknown) {
          const errorMessage = getErrorMessage(err);
          toast.error(`Failed to approve return: ${errorMessage}`);
          console.error("Approve return error:", err);
      } finally {
          setActionLoading(prev => { const newState = { ...prev }; delete newState[deviceId]; return newState; });
      }
  };

   // --- Admin: Reject Return Handler ---
  const handleRejectReturn = async (deviceId: number | string) => {
      if (!user || user.role !== 'admin') { toast.error("Permission denied."); return; }
      const device = devices.find(d => d.id === deviceId);
      if (!device || device.status !== 'pending_return') { toast.error("Device not found or not pending return."); return; }

      setActionLoading(prev => ({ ...prev, [deviceId]: true }));
      try {
          await new Promise(resolve => setTimeout(resolve, 1000));
           if (Math.random() < 0.05) { throw new Error("Simulated rejection error."); }

          // Revert status back to 'borrowed'
          setDevices(prevDevices => prevDevices.map(d =>
              d.id === deviceId ? { ...d, status: 'borrowed' } : d // Keep borrower and dueDate
          ));
          toast.success(`Return for "${device.name}" rejected. Status set back to 'Borrowed'.`);
          // Optional: Notify the user who requested the return
      } catch (err: unknown) {
          const errorMessage = getErrorMessage(err);
          toast.error(`Failed to reject return: ${errorMessage}`);
          console.error("Reject return error:", err);
      } finally {
          setActionLoading(prev => { const newState = { ...prev }; delete newState[deviceId]; return newState; });
      }
  };


  // --- Logout Handler ---
  const handleLogout = () => {
    toast.success("Logged out successfully.");
    localStorage.removeItem("user");
    setUser(null); setDevices([]);
    router.push("/login");
  };

  // --- Admin Action Handlers (Modals) ---
  const handleAddDeviceClick = () => {
      setNewDeviceData(initialDeviceFormData);
      setShowAddModal(true);
  };

  const handleEditDeviceClick = (device: Device) => {
      setEditingDevice(device);
      setEditDeviceData({
          name: device.name,
          type: device.type || "",
          serialNumber: device.serialNumber || "",
          description: device.description || "",
          imageUrl: device.imageUrl || "",
      });
      setShowEditModal(true);
  };

  const handleDeleteDeviceClick = (device: Device) => {
      setDeletingDevice(device);
      setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
      setShowAddModal(false);
      setShowEditModal(false);
      setShowDeleteModal(false);
      setEditingDevice(null);
      setDeletingDevice(null);
      setModalLoading(false);
  };

  const handleModalFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, type: 'new' | 'edit') => {
      const { name, value } = e.target;
      if (type === 'new') {
          setNewDeviceData(prev => ({ ...prev, [name]: value }));
      } else {
          setEditDeviceData(prev => ({ ...prev, [name]: value }));
      }
  };

  const handleSaveNewDevice = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newDeviceData.name.trim()) {
          toast.error("Device name is required.");
          return;
      }
      setModalLoading(true);
      try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newId = `mock-${Date.now()}`;
          const newDevice: Device = {
              id: newId,
              status: 'available',
              ...newDeviceData,
          };
          setDevices(prev => [newDevice, ...prev]);
          toast.success(`Device "${newDevice.name}" added successfully!`);
          handleCloseModals();
      } catch (err) {
          toast.error("Failed to add device: " + getErrorMessage(err));
      } finally {
          setModalLoading(false);
      }
  };

  const handleSaveEditedDevice = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editingDevice || !editDeviceData.name.trim()) {
          toast.error("Device name is required.");
          return;
      }
      setModalLoading(true);
      try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setDevices(prev => prev.map(d =>
              d.id === editingDevice.id ? { ...d, ...editDeviceData } : d
          ));
          toast.success(`Device "${editDeviceData.name}" updated successfully!`);
          handleCloseModals();
      } catch (err) {
          toast.error("Failed to update device: " + getErrorMessage(err));
      } finally {
          setModalLoading(false);
      }
  };

  const handleConfirmDelete = async () => {
      if (!deletingDevice) return;
      setModalLoading(true);
      try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setDevices(prev => prev.filter(d => d.id !== deletingDevice.id));
          toast.success(`Device "${deletingDevice.name}" deleted successfully!`);
          handleCloseModals();
      } catch (err) {
          toast.error("Failed to delete device: " + getErrorMessage(err));
      } finally {
          setModalLoading(false);
      }
  };


  // --- Memoized Devices for Display ---
  const processedDevices = useMemo(() => {
      let result = devices;
      const userId = user?.id;
      const userRole = user?.role;

      // Filter by View/Filter
      switch (currentFilter) {
          case 'available':
              result = result.filter(device => device.status === 'available');
              break;
          case 'borrowed-by-me':
              // Show items borrowed OR pending return by the current user (ONLY if NOT admin)
              if (userRole === 'admin') result = []; // Admins don't have 'My Items'
              else result = result.filter(device =>
                  (device.status === 'borrowed' || device.status === 'pending_return') &&
                  device.borrower?.id === userId
              );
              break;
          case 'borrowed-by-others':
              // Show items borrowed OR pending return by others (Admin view)
              if (userRole !== 'admin') result = []; // Hide for non-admins
              else result = result.filter(device =>
                  (device.status === 'borrowed' || device.status === 'pending_return') // Show both borrowed and pending for this view
                  // No need to check borrower ID here, as admin sees all non-available items not borrowed by themselves (which is none)
              );
              break;
          case 'pending-return':
               // Only show pending returns if user is admin
              if (userRole !== 'admin') result = []; // Hide for non-admins
              else result = result.filter(device => device.status === 'pending_return');
              break;
          case 'all':
          default:
              // 'all' shows all devices regardless of status
              break;
      }

      // Filter by Search Term
      if (searchTerm.trim() !== '') {
          const lowerCaseSearchTerm = searchTerm.toLowerCase();
          result = result.filter(device =>
              device.name.toLowerCase().includes(lowerCaseSearchTerm) ||
              (device.type && device.type.toLowerCase().includes(lowerCaseSearchTerm)) ||
              (device.serialNumber && device.serialNumber.toLowerCase().includes(lowerCaseSearchTerm)) ||
              (device.borrower && device.borrower.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
              (device.description && device.description.toLowerCase().includes(lowerCaseSearchTerm))
          );
      }

      // Sort Devices
      if (sortOrder === 'name-asc') { result = result.sort((a, b) => a.name.localeCompare(b.name)); }
      else if (sortOrder === 'name-desc') { result = result.sort((a, b) => b.name.localeCompare(a.name)); }
      // Default sort: Available -> Pending -> Borrowed -> by Name
      else {
           result = result.sort((a, b) => {
               const statusOrder = { 'available': 1, 'pending_return': 2, 'borrowed': 3 };
               const statusComparison = (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
               if (statusComparison !== 0) return statusComparison;
               return a.name.localeCompare(b.name);
           });
      }

      return result;
  }, [devices, currentFilter, searchTerm, sortOrder, user]);

  // --- Helper: isOverdue ---
  const isOverdue = (dueDate: string | Date | undefined): boolean => {
      if (!dueDate) return false;
      const due = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
  };

  // --- Render Logic ---
  if (loading && devices.length === 0 && !user) {
    // --- Enhanced Loading State ---
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center text-center text-gray-600">
          <FiLoader className="animate-spin text-6xl mb-5 text-indigo-500" />
          <p className="text-xl font-semibold mb-1">Loading Dashboard</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your devices...</p>
        </div>
      </div>
    );
  }

  return (
    // --- Adjusted background gradient ---
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* --- Toaster remains the same --- */}
      <Toaster position="top-right" reverseOrder={false} toastOptions={{
          className: 'text-sm font-medium',
          style: { borderRadius: '8px', background: '#374151', color: '#fff' },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
      }}/>

      {/* --- Header: Slightly stronger border --- */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* --- Logo/Brand --- */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => router.push('/')} title="Go to Dashboard">
             <FiPackage className="text-indigo-600 group-hover:text-indigo-700 text-3xl flex-shrink-0 transition-colors" />
             <span className="text-xl font-bold text-gray-800 tracking-tight hidden sm:inline group-hover:text-gray-900 transition-colors">Device Borrow</span>
             <span className="text-xl font-bold text-gray-800 tracking-tight sm:hidden group-hover:text-gray-900 transition-colors">DB</span>
          </div>
          {/* --- User Info & Logout --- */}
          <div className="flex items-center space-x-4">
             {user && (
                <span className="text-sm text-gray-600 hidden md:flex items-center bg-gray-100/70 px-3 py-1.5 rounded-lg border border-gray-200/80">
                    {user.role === 'admin' && <FiShield className="w-4 h-4 mr-1.5 text-purple-600" title="Administrator"/>}
                    <FiUser className="w-4 h-4 mr-1.5 text-gray-500"/>
                    Welcome, <span className="font-semibold text-gray-900 ml-1">{user.name}</span>
                    {user.role === 'admin' && <span className="ml-2 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">(Admin)</span>}
                </span>
             )}
             {/* --- Logout Button: Slightly softer style --- */}
             <button onClick={handleLogout} title="Logout" className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg shadow-sm hover:bg-red-50 hover:border-red-300 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-red-500 transition-colors duration-150 ease-in-out group">
                <FiLogOut className="h-4 w-4 mr-1.5 text-gray-500 transition-colors duration-150 ease-in-out group-hover:text-red-600" />
                Logout
             </button>
          </div>
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {/* --- Filters Row: Improved styling --- */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            {/* --- Search Input: Enhanced focus --- */}
            <div className="relative lg:col-span-2 md:col-span-2">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"> <FiSearch className="h-5 w-5 text-gray-400" /> </div>
                <input type="text" placeholder="Search devices by name, type, S/N..." value={searchTerm} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-900 placeholder-gray-500 text-sm focus:bg-white" />
            </div>

            {/* --- Filter/Sort Controls --- */}
            <div className="flex flex-wrap items-center justify-start md:justify-end lg:col-span-3 gap-3">
                {/* --- Filter Dropdown: Enhanced style --- */}
                <div className="relative">
                    <select value={currentFilter} onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrentFilter(e.target.value as DeviceFilter)} className="appearance-none w-full sm:w-auto bg-gray-50 border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 transition-colors" aria-label="Filter devices">
                        <option value="all">View: All Devices</option>
                        <option value="available">View: Available</option>
                        {user && user.role !== 'admin' && <option value="borrowed-by-me">View: My Items</option>}
                        {user?.role === 'admin' && <option value="borrowed-by-others">View: Borrowed (Others)</option>}
                        {user?.role === 'admin' && <option value="pending-return">View: Pending Return</option>}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"> <FiChevronDown className="h-4 w-4" /> </div>
                </div>
                {/* --- Sort Dropdown: Enhanced style --- */}
                <div className="relative">
                    <select value={sortOrder} onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value as SortOrder)} className="appearance-none w-full sm:w-auto bg-gray-50 border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-300 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 transition-colors" aria-label="Sort devices">
                        <option value="default">Sort: Default</option>
                        <option value="name-asc">Sort: Name (A-Z)</option>
                        <option value="name-desc">Sort: Name (Z-A)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"> <FiChevronDown className="h-4 w-4" /> </div>
                </div>
                 {/* --- Refresh Button: Slightly refined style --- */}
                 <button onClick={() => fetchDevices(true)} disabled={isRefreshing || loading} title="Refresh List" className={`p-2 rounded-lg text-gray-600 bg-white border border-gray-300 shadow-sm hover:bg-gray-100 hover:border-gray-400 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-wait flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}>
                    <span className="sr-only">Refresh List</span>
                    <FiRefreshCw className="h-5 w-5" />
                 </button>

                 {/* --- Add New Device Button (Admin Only): Clearer style --- */}
                 {user?.role === 'admin' && (
                    <button onClick={handleAddDeviceClick} title="Add New Device" className="p-2 rounded-lg text-white bg-indigo-600 border border-transparent shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-all duration-150 ease-in-out flex items-center justify-center active:bg-indigo-800">
                        <span className="sr-only">Add New Device</span>
                        <FiPlus className="h-5 w-5" />
                    </button>
                 )}
            </div>
        </div>

        {/* --- Inline Loading / Empty State: Improved visuals --- */}
        {isRefreshing && devices.length > 0 && (
            <div className="text-center py-4 text-indigo-600 text-sm flex items-center justify-center font-medium">
                <FiLoader className="animate-spin text-lg inline mr-2.5" /> Updating device list...
            </div>
        )}
        {!loading && !isRefreshing && processedDevices.length === 0 ? (
             <div className="text-center py-16 px-6 bg-white rounded-xl shadow border border-gray-200 mt-8 max-w-lg mx-auto">
                {/* --- More engaging empty state icon --- */}
                <div className="flex justify-center items-center mb-6">
                    <FiInbox className="text-7xl text-gray-300" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? 'No Matching Devices Found' : (
                        currentFilter === 'all' ? 'No Devices in System' :
                        currentFilter === 'available' ? 'No Devices Currently Available' :
                        currentFilter === 'borrowed-by-me' ? 'You Have No Borrowed Items' :
                        currentFilter === 'borrowed-by-others' ? 'No Devices Borrowed by Others' :
                        currentFilter === 'pending-return' ? 'No Devices Pending Return' :
                        'No Devices Found'
                    )}
                </h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                    {searchTerm
                        ? 'Try adjusting your search or filter criteria.'
                        : (currentFilter === 'all' && user?.role === 'admin'
                            ? 'Click the "+" button above to add a new device.'
                            : 'Try changing the filter or click Refresh.')
                    }
                </p>
                {/* --- Refresh button in empty state --- */}
                <button onClick={() => fetchDevices(true)} disabled={isRefreshing || loading} className={`inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${ isRefreshing || loading ? 'bg-gray-300 text-gray-500 cursor-wait' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800' }`}>
                    <FiRefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh List'}
                </button>
            </div>
        ) : null}

        {/* --- Device Grid: Enhanced Card Styling --- */}
        {!loading && processedDevices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedDevices.map((device) => {
                const isBorrowedByCurrentUser = device.borrower?.id === user?.id;
                const isAdmin = user?.role === 'admin';
                const isActionInProgress = !!actionLoading[device.id];

                // --- Determine Button Visibility & State ---
                const showBorrowButton = !isAdmin && device.status === 'available';
                const showUserReturnButton = !isAdmin && device.status === 'borrowed' && isBorrowedByCurrentUser;
                const showAdminReturnButton = isAdmin && device.status === 'borrowed';
                const showAdminApproveReject = isAdmin && device.status === 'pending_return';
                const showUserPendingText = !isAdmin && device.status === 'pending_return' && isBorrowedByCurrentUser;

                const borrowDisabled = !user || isActionInProgress || isAdmin;
                const returnDisabled = !user || isActionInProgress;

                return (
                  // --- Enhanced Card Styling: Reduced Padding ---
                  <div key={device.id} className="bg-white rounded-xl border border-gray-200 flex flex-col relative overflow-hidden transition-all duration-200 ease-out shadow-sm hover:shadow-lg hover:border-indigo-300 group">
                    {/* --- Loading overlay --- */}
                    {isActionInProgress && (
                        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl">
                            <FiLoader className="animate-spin text-indigo-500 text-4xl" />
                        </div>
                    )}

                    {/* --- Image Area --- */}
                    <div className="aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl relative border-b border-gray-200">
                        {device.imageUrl ? (
                            <img src={device.imageUrl} alt={`Image of ${device.name}`} className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105" loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; const parent = e.currentTarget.parentElement; if (parent) { const placeholder = parent.querySelector('.placeholder-icon'); if (placeholder) placeholder.classList.remove('hidden'); } }}
                            />
                        ) : null}
                        {/* --- Placeholder --- */}
                        <div className={`placeholder-icon ${device.imageUrl ? 'hidden' : ''} flex flex-col items-center justify-center w-full h-full text-gray-400 bg-gray-100`}>
                            <FiImage className="text-5xl mb-1" />
                            <span className="text-xs font-medium">No Image</span>
                        </div>
                        {/* --- Admin Edit/Delete Buttons --- */}
                        {isAdmin && (
                            <div className="absolute top-2.5 right-2.5 flex space-x-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={() => handleEditDeviceClick(device)} title="Edit Device" className="p-2 bg-white/80 hover:bg-white rounded-lg text-gray-700 hover:text-blue-600 shadow-md backdrop-blur-sm transition-all duration-150 ease-in-out hover:scale-110"> <FiEdit className="w-4 h-4" /> </button>
                                <button onClick={() => handleDeleteDeviceClick(device)} title="Delete Device" className="p-2 bg-white/80 hover:bg-white rounded-lg text-gray-700 hover:text-red-600 shadow-md backdrop-blur-sm transition-all duration-150 ease-in-out hover:scale-110"> <FiTrash2 className="w-4 h-4" /> </button>
                            </div>
                        )}
                    </div>

                    {/* --- Content Area: Reduced Padding --- */}
                    <div className="p-4 flex flex-col flex-grow"> {/* Reduced p-5 to p-4 */}
                        <h3 className="text-base font-semibold text-gray-800 truncate mb-1 group-hover:text-indigo-700 transition-colors" title={device.name}> {device.name} </h3>
                        {device.type && <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">{device.type}</p>} {/* Reduced mb-2.5 to mb-2 */}
                        {device.description && ( <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow" title={device.description}> {device.description} </p> )} {/* Reduced mb-4 to mb-3 */}
                        {device.serialNumber && ( <p className="text-xs text-gray-400 font-mono mt-auto pt-2 border-t border-gray-100"> S/N: {device.serialNumber} </p> )} {/* Reduced pt-2.5 to pt-2 */}
                    </div>

                    {/* --- Status and Action Area: Reduced Padding --- */}
                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl"> {/* Reduced Padding */}
                        {/* --- Status/Borrower Info: Reduced Height/Margin --- */}
                        <div className="min-h-[4rem] mb-3 flex flex-col justify-center space-y-1.5"> {/* Reduced min-h and mb */}
                            {device.status === 'available' ? (
                                 <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                                    {/* --- Available Badge --- */}
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 ring-1 ring-inset ring-green-200">
                                        <FiCheckCircle className="-ml-0.5 mr-1.5 h-3.5 w-3.5" /> Available
                                    </span>
                                </div>
                            ) : device.status === 'borrowed' || device.status === 'pending_return' ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</span>
                                        {device.status === 'borrowed' ? (
                                             /* --- Borrowed Badge --- */
                                             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-200">
                                                <FiArrowRight className="-ml-0.5 mr-1.5 h-3.5 w-3.5" /> Borrowed
                                             </span>
                                        ) : (
                                             /* --- Pending Return Badge --- */
                                             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200">
                                                <FiClock className="-ml-0.5 mr-1.5 h-3.5 w-3.5" /> Pending Return
                                             </span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-xs text-gray-600">
                                        <FiUser className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0"/>
                                        <span className="truncate"> By: <span className="font-medium text-gray-800 ml-1">{device.borrower?.name || 'N/A'}</span> {isBorrowedByCurrentUser && !isAdmin && <span className="text-indigo-600 font-medium ml-1">(You)</span>} </span>
                                    </div>
                                    {device.dueDate && (
                                        <div className="flex items-center text-xs text-gray-600">
                                            <FiCalendar className="mr-1.5 h-4 w-4 text-gray-400 flex-shrink-0"/> Due:
                                            <span className={`font-medium ml-1 ${isOverdue(device.dueDate) ? 'text-red-600 font-bold' : 'text-gray-800'}`}> {new Date(device.dueDate).toLocaleDateString()} {isOverdue(device.dueDate) && <span className="ml-1 font-bold">(Overdue!)</span>} </span>
                                        </div>
                                    )}
                                </>
                            ) : null}
                        </div>
                        {/* --- Action Buttons --- */}
                        <div className="h-10 flex items-center"> {/* Container to prevent layout shifts */}
                            {showBorrowButton && (
                                <button onClick={() => handleAction('borrow', device.id)} disabled={borrowDisabled} title={isAdmin ? "Admins cannot borrow" : "Borrow this device"} className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${ borrowDisabled ? 'bg-indigo-300 text-indigo-500 cursor-not-allowed opacity-80' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 active:scale-[0.98]' }`}>
                                    <FiArrowRight className="mr-1.5 h-4 w-4" /> Borrow
                                </button>
                            )}
                            {showUserReturnButton && (
                                <button onClick={() => handleAction('return', device.id)} disabled={returnDisabled} title="Request to Return" className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out active:scale-[0.98] ${ !returnDisabled ? 'bg-gray-700 text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 active:bg-gray-900' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-80' }`}>
                                    <FiArrowLeft className="mr-1.5 h-4 w-4" /> Request Return
                                </button>
                            )}
                            {showAdminReturnButton && (
                                <button onClick={() => handleAction('return', device.id)} disabled={returnDisabled} title="Force Return (Admin)" className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out active:scale-[0.98] ${ !returnDisabled ? 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 active:bg-purple-800' : 'bg-purple-300 text-purple-500 cursor-not-allowed opacity-80' }`}>
                                    <FiArrowLeft className="mr-1.5 h-4 w-4" /> Force Return
                                </button>
                            )}
                            {showAdminApproveReject && (
                                <div className="flex space-x-3 w-full">
                                    {/* --- Approve Button --- */}
                                    <button onClick={() => handleApproveReturn(device.id)} disabled={isActionInProgress} className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 ${ isActionInProgress ? 'bg-green-300 text-green-500 cursor-not-allowed opacity-80' : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 active:scale-[0.98]' }`}>
                                        <FiCheck className="mr-1.5 h-4 w-4" /> Approve
                                    </button>
                                    {/* --- Reject Button --- */}
                                    <button onClick={() => handleRejectReturn(device.id)} disabled={isActionInProgress} className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg shadow-sm transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 ${ isActionInProgress ? 'bg-red-300 text-red-500 cursor-not-allowed opacity-80' : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 active:scale-[0.98]' }`}>
                                        <FiSlash className="mr-1.5 h-4 w-4" /> Reject
                                    </button>
                                </div>
                            )}
                            {showUserPendingText && (
                                // --- Pending Text ---
                                <div className="text-center text-sm text-blue-700 bg-blue-100/80 px-3 py-2 rounded-lg border border-blue-200/80 h-full flex items-center justify-center font-medium">
                                    <FiInfo size={16} className="mr-2 text-blue-600"/>
                                    Pending Admin Approval
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                )
            })}
          </div>
        ) : null}
      </main>

      {/* --- Footer --- */}
      <footer className="text-center py-6 mt-12 text-xs text-gray-500 border-t border-gray-200 bg-white">
          © {new Date().getFullYear()} Office Device Borrow System.
          <span className="hidden sm:inline"> Built with Next.js & Tailwind CSS.</span>
      </footer>

      {/* --- Modals (Admin Only): Enhanced Styling --- */}
      {user?.role === 'admin' && (
        <>
          {/* --- Add Device Modal --- */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <form onSubmit={handleSaveNewDevice}>
                  {/* --- Modal Header: Reduced Padding --- */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10"> {/* Reduced p-5 to p-4 */}
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FiPlusCircle className="mr-2.5 text-indigo-600"/> Add New Device
                    </h3>
                    <button type="button" onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"> <FiX size={22} /> </button>
                  </div>
                  {/* --- Modal Body --- */}
                  <div className="p-6 space-y-5 flex-grow overflow-y-auto modal-body"> {/* Keep p-6 for body content */}
                    <div> <label htmlFor="newName" className="modal-label">Name <span className="text-red-500">*</span></label> <input type="text" id="newName" name="name" value={newDeviceData.name} onChange={(e) => handleModalFormChange(e, 'new')} required className="modal-input" placeholder="e.g., Laptop XPS 13"/> </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div> <label htmlFor="newType" className="modal-label">Type</label> <input type="text" id="newType" name="type" value={newDeviceData.type} onChange={(e) => handleModalFormChange(e, 'new')} className="modal-input" placeholder="e.g., Laptop, Monitor"/> </div>
                        <div> <label htmlFor="newSerial" className="modal-label">Serial Number</label> <input type="text" id="newSerial" name="serialNumber" value={newDeviceData.serialNumber} onChange={(e) => handleModalFormChange(e, 'new')} className="modal-input" placeholder="e.g., SN-12345XYZ"/> </div>
                    </div>
                    <div> <label htmlFor="newDesc" className="modal-label">Description</label> <textarea id="newDesc" name="description" value={newDeviceData.description} onChange={(e) => handleModalFormChange(e, 'new')} rows={3} className="modal-input" placeholder="Brief description of the device..."></textarea> </div>
                    <div> <label htmlFor="newImg" className="modal-label">Image URL</label> <input type="url" id="newImg" name="imageUrl" value={newDeviceData.imageUrl} onChange={(e) => handleModalFormChange(e, 'new')} className="modal-input" placeholder="https://example.com/image.jpg"/> </div>
                  </div>
                  {/* --- Modal Footer: Reduced Padding --- */}
                  <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl space-x-3 sticky bottom-0 z-10"> {/* Reduced p-5 to p-4 */}
                    <button type="button" onClick={handleCloseModals} disabled={modalLoading} className="modal-button-secondary">Cancel</button>
                    <button type="submit" disabled={modalLoading || !newDeviceData.name.trim()} className="modal-button-primary"> {modalLoading && <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />} Save Device </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- Edit Device Modal --- */}
          {showEditModal && editingDevice && (
             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <form onSubmit={handleSaveEditedDevice}>
                  {/* --- Modal Header: Reduced Padding --- */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10"> {/* Reduced p-5 to p-4 */}
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center truncate pr-4">
                        <FiEdit3 className="mr-2.5 text-indigo-600"/> Edit: {editingDevice.name}
                    </h3>
                    <button type="button" onClick={handleCloseModals} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"> <FiX size={22} /> </button>
                  </div>
                   {/* --- Modal Body --- */}
                  <div className="p-6 space-y-5 flex-grow overflow-y-auto modal-body"> {/* Keep p-6 for body content */}
                    <div> <label htmlFor="editName" className="modal-label">Name <span className="text-red-500">*</span></label> <input type="text" id="editName" name="name" value={editDeviceData.name} onChange={(e) => handleModalFormChange(e, 'edit')} required className="modal-input" /> </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div> <label htmlFor="editType" className="modal-label">Type</label> <input type="text" id="editType" name="type" value={editDeviceData.type} onChange={(e) => handleModalFormChange(e, 'edit')} className="modal-input" /> </div>
                        <div> <label htmlFor="editSerial" className="modal-label">Serial Number</label> <input type="text" id="editSerial" name="serialNumber" value={editDeviceData.serialNumber} onChange={(e) => handleModalFormChange(e, 'edit')} className="modal-input" /> </div>
                    </div>
                    <div> <label htmlFor="editDesc" className="modal-label">Description</label> <textarea id="editDesc" name="description" value={editDeviceData.description} onChange={(e) => handleModalFormChange(e, 'edit')} rows={3} className="modal-input"></textarea> </div>
                    <div> <label htmlFor="editImg" className="modal-label">Image URL</label> <input type="url" id="editImg" name="imageUrl" value={editDeviceData.imageUrl} onChange={(e) => handleModalFormChange(e, 'edit')} className="modal-input" placeholder="https://example.com/image.jpg"/> </div>
                  </div>
                  {/* --- Modal Footer: Reduced Padding --- */}
                  <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl space-x-3 sticky bottom-0 z-10"> {/* Reduced p-5 to p-4 */}
                    <button type="button" onClick={handleCloseModals} disabled={modalLoading} className="modal-button-secondary">Cancel</button>
                    <button type="submit" disabled={modalLoading || !editDeviceData.name.trim()} className="modal-button-primary"> {modalLoading && <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />} Save Changes </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- Confirm Delete Modal --- */}
          {showDeleteModal && deletingDevice && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                 {/* --- Modal Header: Reduced Padding, Adjusted Icon --- */}
                 <div className="flex justify-between items-center p-4 border-b border-red-200 bg-red-50 rounded-t-xl"> {/* Reduced p-5 to p-4, Added bg/border color */}
                    <h3 className="text-lg font-semibold text-red-800 flex items-center"> {/* Adjusted text color */}
                        <FiAlertTriangle className="mr-2.5 text-red-600"/> {/* Adjusted icon color */}
                        Confirm Deletion
                    </h3>
                    <button type="button" onClick={handleCloseModals} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"> <FiX size={22} /> </button> {/* Adjusted colors */}
                  </div>
                  {/* --- Modal Body --- */}
                  <div className="p-6"> {/* Keep p-6 for body content */}
                    <p className="text-sm text-gray-700 leading-relaxed">Are you sure you want to permanently delete the device <strong className="text-gray-900 font-semibold">{deletingDevice.name}</strong>? This action cannot be undone.</p>
                  </div>
                  {/* --- Modal Footer: Reduced Padding --- */}
                  <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl space-x-3"> {/* Reduced p-5 to p-4 */}
                    <button type="button" onClick={handleCloseModals} disabled={modalLoading} className="modal-button-secondary">Cancel</button>
                    {/* --- Delete Button --- */}
                    <button type="button" onClick={handleConfirmDelete} disabled={modalLoading} className="modal-button-danger"> {modalLoading && <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />} Delete Device </button>
                  </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- Helper styles for Modals (Refined) --- */}
      <style jsx global>{`
        .modal-label {
          display: block; margin-bottom: 0.375rem; /* mb-1.5 */
          font-size: 0.875rem; /* text-sm */ line-height: 1.25rem;
          font-weight: 500; /* font-medium */ color: #374151; /* text-gray-700 */
        }
        .modal-input {
          display: block; width: 100%; padding: 0.625rem 0.875rem; /* py-2.5 px-3.5 */
          font-size: 0.875rem; line-height: 1.25rem;
          color: #1f2937; /* text-gray-900 */ background-color: #fff;
          border: 1px solid #d1d5db; /* border-gray-300 */ border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .modal-input:focus {
          outline: none; border-color: #6366f1; /* focus:border-indigo-500 */
          box-shadow: 0 0 0 3px rgb(165 180 252 / 40%); /* focus:ring-indigo-300 focus:ring-opacity-40 - Adjusted */
        }
        .modal-input::placeholder {
            color: #9ca3af; /* placeholder-gray-400 */
        }
        /* Ensure textarea resizes vertically only */
        .modal-input[type="text"],
        .modal-input[type="url"],
        .modal-input[type="email"],
        .modal-input[type="password"],
        textarea.modal-input {
            resize: vertical;
        }
        /* Adjusted max-height based on potentially smaller header/footer */
        .modal-body { max-height: calc(90vh - 128px); /* Was 140px, now 64+64=128px for p-4 header/footer */ }

        /* Modal Buttons */
        .modal-button {
            display: inline-flex; align-items: center; justify-content: center;
            padding: 0.5rem 1rem; /* py-2 px-4 - Adjusted padding */ font-size: 0.875rem; /* text-sm */
            font-weight: 500; /* font-medium */ border-radius: 0.5rem; /* rounded-lg */
            border: 1px solid transparent; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
            transition: all 0.15s ease-in-out;
            cursor: pointer; line-height: 1.25rem; /* Added for consistency */
        }
        .modal-button:focus { outline: none; box-shadow: 0 0 0 3px rgb(199 210 254 / 50%); }
        .modal-button:disabled { opacity: 0.7; cursor: not-allowed; } /* Slightly adjusted opacity */

        .modal-button-primary {
            background-color: #4f46e5; /* bg-indigo-600 */ color: white;
        }
        .modal-button-primary:not(:disabled):hover { background-color: #4338ca; /* hover:bg-indigo-700 */ }
        .modal-button-primary:disabled { background-color: #a5b4fc; /* disabled:bg-indigo-300 */ }
        .modal-button-primary:focus { box-shadow: 0 0 0 3px rgb(165 180 252 / 50%); } /* Adjusted focus ring */

        .modal-button-secondary {
            background-color: white; color: #374151; /* text-gray-700 */
            border-color: #d1d5db; /* border-gray-300 */
        }
        .modal-button-secondary:not(:disabled):hover { background-color: #f9fafb; /* hover:bg-gray-50 */ border-color: #9ca3af; /* hover:border-gray-400 */ }
        .modal-button-secondary:disabled { background-color: #f3f4f6; /* disabled:bg-gray-100 */ color: #9ca3af; /* disabled:text-gray-400 */ }
        .modal-button-secondary:focus { border-color: #9ca3af; box-shadow: 0 0 0 3px rgb(209 213 219 / 50%); } /* Adjusted focus ring */

        .modal-button-danger {
            background-color: #dc2626; /* bg-red-600 */ color: white;
        }
        .modal-button-danger:not(:disabled):hover { background-color: #b91c1c; /* hover:bg-red-700 */ }
        .modal-button-danger:disabled { background-color: #fca5a5; /* disabled:bg-red-300 */ }
        .modal-button-danger:focus { box-shadow: 0 0 0 3px rgb(252 165 165 / 50%); } /* focus:ring-red-300 */

        /* Simple fade-in animation for modals */
        @keyframes fade-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } } /* Adjusted scale */
        .animate-fade-in { animation: fade-in 0.15s ease-out forwards; } /* Faster animation */

      `}</style>

    </div>
  );
}
