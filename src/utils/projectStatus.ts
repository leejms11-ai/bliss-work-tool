import { InteriorProject } from '../types/project';

export type AutomatedStatusType = '준비중' | '시공중' | '완료' | 'as 및 마감 중';

export interface AutomatedStatusInfo {
  status: AutomatedStatusType;
  color: string;
  badgeBg: string;
  badgeText: string;
  label: string;
  reason: string;
}

export const TODAY_DEFAULT = '2026-10-22';

/**
 * 진행 상태 자동화 규칙:
 * 1. 별도 as 및 미마감에 대한 내용이 등록된 경우 (접수 또는 처리중) = as 및 마감 중 (주황색 #F59E0B)
 * 2. 시공일자 이전일 경우 = 준비중 (초록색 #10B981)
 * 3. 시공일자 중일 경우 = 시공중 (파란색 #2563EB)
 * 4. 시공일자가 지난 경우 = 완료 (검정색 #1F2937)
 */
export function computeProjectStatus(
  project: Pick<InteriorProject, 'startDate' | 'endDate' | 'defectAndAS'>,
  currentDate = TODAY_DEFAULT
): AutomatedStatusInfo {
  const hasActiveAS =
    project.defectAndAS &&
    project.defectAndAS.some(d => d.status === '접수' || d.status === '처리중');

  if (hasActiveAS) {
    return {
      status: 'as 및 마감 중',
      color: '#F59E0B', // 주황색
      badgeBg: 'bg-amber-100 border border-amber-300',
      badgeText: 'text-amber-800',
      label: 'as 및 마감 중',
      reason: 'A/S 또는 미마감 항목이 등록되어 처리 중입니다.'
    };
  }

  if (currentDate < project.startDate) {
    return {
      status: '준비중',
      color: '#10B981', // 초록색
      badgeBg: 'bg-emerald-100 border border-emerald-300',
      badgeText: 'text-emerald-800',
      label: '준비중',
      reason: '착공일자 이전으로 시공 준비 단계입니다.'
    };
  }

  if (currentDate > project.endDate) {
    return {
      status: '완료',
      color: '#1F2937', // 검정색
      badgeBg: 'bg-neutral-800 text-white',
      badgeText: 'text-white',
      label: '완료',
      reason: '시공일자가 종료되어 완공되었습니다.'
    };
  }

  return {
    status: '시공중',
    color: '#2563EB', // 파란색
    badgeBg: 'bg-blue-100 border border-blue-300',
    badgeText: 'text-blue-800',
    label: '시공중',
    reason: '시공일자 기간 내 정상 공사 진행 중입니다.'
  };
}
