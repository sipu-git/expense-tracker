export function getParam(param: string | string[] | undefined): string {
  if (!param || Array.isArray(param)) {
    throw new Error("Invalid parameter");
  }
  return param;
}