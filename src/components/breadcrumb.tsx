import { Link } from 'wouter';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/dashboard">
            <a className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary">
              <span className="material-icons text-sm mr-2">home</span>
              Dashboard
            </a>
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} aria-current={isLast ? "page" : undefined}>
              <div className="flex items-center">
                <span className="material-icons text-gray-400 text-sm">chevron_right</span>
                {item.href && !isLast ? (
                  <Link href={item.href}>
                    <a className="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2">
                      {item.label}
                    </a>
                  </Link>
                ) : (
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
