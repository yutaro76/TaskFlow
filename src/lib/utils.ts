import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInviteCode(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    // Math.random() * characters.length: 0以上1未満の乱数を生成し、それにcharacters.lengthを掛けることで、0以上characters.length未満の乱数を生成する。
    // Math.floor()で小数点以下を切り捨てることで、0以上characters.length未満の整数を生成する。
    // これにより、charactersの中からランダムに文字を選ぶことができる。
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
