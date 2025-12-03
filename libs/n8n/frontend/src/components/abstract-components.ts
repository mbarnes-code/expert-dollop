/**
 * Abstract component patterns for Vue.js applications.
 * Provides common patterns for building reusable components following DDD principles.
 */

import { defineComponent, h, type PropType, type VNode, type Component } from 'vue';

/**
 * Common component prop types
 */
export interface IBaseComponentProps {
  /** Component ID */
  id?: string;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: Record<string, string>;
  /** Data attributes */
  dataAttributes?: Record<string, string>;
  /** ARIA attributes */
  ariaAttributes?: Record<string, string>;
}

/**
 * Component size variants
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component color variants
 */
export type ComponentColor = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'light' 
  | 'dark';

/**
 * Component status variants
 */
export type ComponentStatus = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

/**
 * Base props for form components
 */
export interface IFormFieldProps extends IBaseComponentProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is readonly */
  readonly?: boolean;
}

/**
 * Base props for button components
 */
export interface IButtonProps extends IBaseComponentProps {
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Button variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /** Button color */
  color?: ComponentColor;
  /** Button size */
  size?: ComponentSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is loading */
  loading?: boolean;
  /** Icon name (left) */
  leftIcon?: string;
  /** Icon name (right) */
  rightIcon?: string;
}

/**
 * Base props for modal components
 */
export interface IModalProps extends IBaseComponentProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: ComponentSize;
  /** Whether to close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
}

/**
 * Base props for list components
 */
export interface IListProps<T = unknown> extends IBaseComponentProps {
  /** List items */
  items: T[];
  /** Key extractor function */
  keyExtractor?: (item: T, index: number) => string | number;
  /** Whether the list is loading */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Base props for table components
 */
export interface ITableColumn<T = unknown> {
  /** Column key */
  key: string;
  /** Column header */
  header: string;
  /** Column width */
  width?: string | number;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Custom cell renderer */
  render?: (item: T, index: number) => VNode | string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

export interface ITableProps<T = unknown> extends IListProps<T> {
  /** Table columns */
  columns: ITableColumn<T>[];
  /** Whether the table is selectable */
  selectable?: boolean;
  /** Selected item keys */
  selectedKeys?: (string | number)[];
  /** Sort column */
  sortColumn?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Base props for dropdown/select components
 */
export interface IDropdownOption<T = string> {
  /** Option value */
  value: T;
  /** Option label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Option group */
  group?: string;
  /** Option icon */
  icon?: string;
}

export interface IDropdownProps<T = string> extends IFormFieldProps {
  /** Dropdown options */
  options: IDropdownOption<T>[];
  /** Selected value */
  modelValue?: T;
  /** Whether multiple selection is allowed */
  multiple?: boolean;
  /** Whether the dropdown is searchable */
  searchable?: boolean;
  /** Whether the dropdown is clearable */
  clearable?: boolean;
}

/**
 * Icon component props
 */
export interface IIconProps extends IBaseComponentProps {
  /** Icon name */
  name: string;
  /** Icon size */
  size?: ComponentSize | number;
  /** Icon color */
  color?: string;
  /** Whether to spin the icon */
  spin?: boolean;
}

/**
 * Loading indicator props
 */
export interface ILoadingProps extends IBaseComponentProps {
  /** Loading size */
  size?: ComponentSize;
  /** Loading text */
  text?: string;
  /** Whether to show overlay */
  overlay?: boolean;
  /** Loading type */
  type?: 'spinner' | 'dots' | 'bars';
}

/**
 * Alert/notification props
 */
export interface IAlertProps extends IBaseComponentProps {
  /** Alert type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Whether the alert is dismissible */
  dismissible?: boolean;
  /** Alert icon */
  icon?: string;
  /** Auto-dismiss duration in ms */
  duration?: number;
}

/**
 * Tooltip props
 */
export interface ITooltipProps extends IBaseComponentProps {
  /** Tooltip content */
  content: string;
  /** Tooltip placement */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Trigger type */
  trigger?: 'hover' | 'click' | 'focus';
  /** Show delay in ms */
  delay?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
}

/**
 * Pagination props
 */
export interface IPaginationProps extends IBaseComponentProps {
  /** Current page */
  page: number;
  /** Total pages */
  totalPages: number;
  /** Page size */
  pageSize?: number;
  /** Total items */
  totalItems?: number;
  /** Whether to show page size selector */
  showPageSizeSelector?: boolean;
  /** Available page sizes */
  pageSizes?: number[];
  /** Whether to show quick jumper */
  showQuickJumper?: boolean;
}

/**
 * Tabs props
 */
export interface ITabItem {
  /** Tab key */
  key: string;
  /** Tab label */
  label: string;
  /** Tab icon */
  icon?: string;
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Tab badge */
  badge?: string | number;
}

export interface ITabsProps extends IBaseComponentProps {
  /** Tab items */
  items: ITabItem[];
  /** Active tab key */
  activeKey: string;
  /** Tab position */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Tab type */
  type?: 'line' | 'card' | 'pills';
}

/**
 * Breadcrumb props
 */
export interface IBreadcrumbItem {
  /** Breadcrumb label */
  label: string;
  /** Breadcrumb href */
  href?: string;
  /** Breadcrumb icon */
  icon?: string;
}

export interface IBreadcrumbProps extends IBaseComponentProps {
  /** Breadcrumb items */
  items: IBreadcrumbItem[];
  /** Separator */
  separator?: string;
}

/**
 * Avatar props
 */
export interface IAvatarProps extends IBaseComponentProps {
  /** Avatar image src */
  src?: string;
  /** Avatar alt text */
  alt?: string;
  /** Fallback initials */
  initials?: string;
  /** Avatar size */
  size?: ComponentSize | number;
  /** Avatar shape */
  shape?: 'circle' | 'square';
  /** Avatar status indicator */
  status?: 'online' | 'offline' | 'busy' | 'away';
}

/**
 * Badge props
 */
export interface IBadgeProps extends IBaseComponentProps {
  /** Badge content */
  content?: string | number;
  /** Badge color */
  color?: ComponentColor;
  /** Badge variant */
  variant?: 'solid' | 'outline' | 'dot';
  /** Maximum value (for numbers) */
  max?: number;
  /** Whether to show zero */
  showZero?: boolean;
}

/**
 * Component event emitter type helper
 */
export type ComponentEmits<T extends Record<string, (...args: unknown[]) => void>> = T;

/**
 * Create typed props helper
 */
export function defineProps<T extends object>(): T {
  return {} as T;
}

/**
 * Create CSS class builder
 */
export function createClassBuilder(baseClass: string) {
  return {
    base: baseClass,
    add: (...classes: (string | undefined | null | false)[]) => {
      return [baseClass, ...classes.filter(Boolean)].join(' ');
    },
    modifier: (modifier: string, condition = true) => {
      return condition ? `${baseClass}--${modifier}` : '';
    },
    element: (element: string) => {
      return `${baseClass}__${element}`;
    },
  };
}

/**
 * Generate component class names based on props
 */
export function generateComponentClasses(
  baseClass: string,
  props: {
    size?: ComponentSize;
    color?: ComponentColor;
    variant?: string;
    disabled?: boolean;
    loading?: boolean;
    [key: string]: unknown;
  },
): string {
  const classes = [baseClass];
  
  if (props.size) {
    classes.push(`${baseClass}--${props.size}`);
  }
  if (props.color) {
    classes.push(`${baseClass}--${props.color}`);
  }
  if (props.variant) {
    classes.push(`${baseClass}--${props.variant}`);
  }
  if (props.disabled) {
    classes.push(`${baseClass}--disabled`);
  }
  if (props.loading) {
    classes.push(`${baseClass}--loading`);
  }
  
  return classes.join(' ');
}

/**
 * Merge component refs
 */
export function mergeRefs<T>(...refs: ((el: T | null) => void)[]): (el: T | null) => void {
  return (el: T | null) => {
    refs.forEach(ref => ref(el));
  };
}

/**
 * Component slot types helper
 */
export interface ISlots {
  default?: () => VNode[];
  [key: string]: (() => VNode[]) | undefined;
}

/**
 * Create a forwarded slots helper
 */
export function forwardSlots(slots: ISlots, exclude: string[] = []): ISlots {
  const forwarded: ISlots = {};
  for (const [name, slot] of Object.entries(slots)) {
    if (!exclude.includes(name) && slot) {
      forwarded[name] = slot;
    }
  }
  return forwarded;
}
