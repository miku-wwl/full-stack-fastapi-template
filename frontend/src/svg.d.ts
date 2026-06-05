declare module "*.svg?react" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare namespace React {
  interface TdHTMLAttributes<T> {
    isHeader?: boolean;
  }
}
