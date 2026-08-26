export const PROTOTYPE_INVITE_CODE = '462649';

export function canAcceptInvite(code: string): boolean {
  return code.trim() === PROTOTYPE_INVITE_CODE;
}
