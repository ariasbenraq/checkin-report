// src/components/Navbar.tsx
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { getToken, getUsernameFromToken, signOut } from '../utils/auth';


interface NavbarProps {
  current: 'home' | 'upload' | 'list';
  onNavigate: (view: 'home' | 'upload' | 'list') => void;
}

const navigation = [
  { name: 'Instrucciones', key: 'home' },
  { name: 'Cargar PDF', key: 'upload' },
  { name: 'PDFs Registrados', key: 'list' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ current, onNavigate }: NavbarProps) {
  const token = getToken();
  const username = getUsernameFromToken(token || '') || 'Usuario';

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between">
              {/* IZQUIERDA: brand + nav */}
              <div className="flex items-center">
                <div className="flex-shrink-0 text-white font-bold text-lg">
                  logistica CDV
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => onNavigate(item.key as NavbarProps['current'])}
                        className={classNames(
                          current === item.key
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DERECHA: usuario + cerrar sesión (desktop) */}
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-gray-300 text-sm">
                  Hola, <strong className="text-white">{username}</strong>
                </span>

                <button
                  onClick={() => signOut()}
                  className="px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                  title="Cerrar sesión y cambiar de usuario"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>

              {/* Botón hamburguesa (móvil) */}
              <div className="flex sm:hidden">
                <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Panel móvil */}
          <DisclosurePanel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.key}
                  as="button"
                  onClick={() => onNavigate(item.key as NavbarProps['current'])}
                  className={classNames(
                    current === item.key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium w-full text-left'
                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>

            {/* Bloque inferior: usuario + cerrar sesión (móvil) */}
            <div className="border-t border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="text-gray-300 text-sm">
                Sesión: <span className="text-white font-semibold">{username}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="mt-0 px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
