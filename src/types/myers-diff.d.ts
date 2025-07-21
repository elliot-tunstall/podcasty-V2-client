declare module "myers-diff" {
  export function diff(
    lhs: string,
    rhs: string,
    options?: {
      compare?: "words" | "lines" | "chars";
      ignoreWhitespace?: boolean;
      ignoreCase?: boolean;
      ignoreAccents?: boolean;
    }
  ): any[];
  export function changed(part: any): boolean;
}