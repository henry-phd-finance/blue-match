/**
 * 두 매물(A, B) 간의 단방향 및 쌍방 이상형 매칭 점수와 상세 사유를 계산합니다.
 */
export function evaluateDirectionalMatch(seeker, candidate) {
  const ideal = seeker.ideal_type || {};
  const attrs = candidate.attributes || {};

  let score = 0;
  let maxScore = 0;
  const matchedReasons = [];
  const missedReasons = [];
  let dealBreakerTriggered = false;

  // 1. 출생연도(나이) 조건 (가중치 25)
  maxScore += 25;
  const minYear = ideal.min_birth_year || 1970;
  const maxYear = ideal.max_birth_year || 2010;
  if (candidate.birth_year >= minYear && candidate.birth_year <= maxYear) {
    score += 25;
    matchedReasons.push(`희망 나이 부합 (${candidate.birth_year}년생)`);
  } else {
    const diff = candidate.birth_year < minYear
      ? minYear - candidate.birth_year
      : candidate.birth_year - maxYear;
    if (diff <= 2) {
      score += 12;
      missedReasons.push(`희망 나이 ${diff}살 차이`);
    } else {
      missedReasons.push(`희망 나이 범위 밖 (${minYear}~${maxYear}년생 희망)`);
    }
  }

  // 2. 키(신장) 조건 (가중치 20)
  maxScore += 20;
  const minHeight = ideal.min_height || 0;
  const maxHeight = ideal.max_height || 250;
  if (candidate.height) {
    if (candidate.height >= minHeight && candidate.height <= maxHeight) {
      score += 20;
      matchedReasons.push(`희망 키 부합 (${candidate.height}cm)`);
    } else if (candidate.height >= minHeight - 3 && candidate.height <= maxHeight + 3) {
      score += 10;
      missedReasons.push(`희망 키 근접 (${candidate.height}cm)`);
    } else {
      missedReasons.push(`희망 키 미달 (${minHeight}cm 이상 희망)`);
    }
  } else {
    score += 10;
  }

  // 3. 희망 직업군 조건 (가중치 20)
  const prefJobs = ideal.preferred_job_categories || [];
  if (prefJobs.length > 0) {
    maxScore += 20;
    if (attrs.job_category && prefJobs.includes(attrs.job_category)) {
      score += 20;
      matchedReasons.push(`선호 직업군 일치 (${attrs.job_category})`);
    } else {
      score += 5;
      missedReasons.push(`선호 직업군 외 (${attrs.job_category || '미기재'})`);
    }
  }

  // 4. 선호 외모/분위기 태그 일치도 (가중치 20)
  const prefLooks = ideal.preferred_look_tags || [];
  const candLooks = attrs.look_tags || [];
  if (prefLooks.length > 0) {
    maxScore += 20;
    const overlap = prefLooks.filter((tag) => candLooks.includes(tag));
    if (overlap.length >= 2) {
      score += 20;
      matchedReasons.push(`이상형 외모 태그 ${overlap.join(' ')} 일치`);
    } else if (overlap.length === 1) {
      score += 14;
      matchedReasons.push(`이상형 외모 태그 ${overlap[0]} 일치`);
    } else {
      score += 4;
    }
  }

  // 5. 라이프스타일 & 취미 공통점 보너스 (가중치 15)
  maxScore += 15;
  const seekerHobbies = seeker.attributes?.personality_tags || [];
  const candHobbies = attrs.personality_tags || [];
  const commonHobbies = seekerHobbies.filter((t) => candHobbies.includes(t));
  if (commonHobbies.length > 0) {
    score += Math.min(15, 8 + commonHobbies.length * 4);
    matchedReasons.push(`공통 성향/취미 ${commonHobbies.slice(0, 2).join(' ')}`);
  } else {
    score += 6;
  }

  // 6. Deal-breaker (절대 불가 조건) 체크
  const breakers = ideal.deal_breakers || [];
  if (breakers.includes('흡연자 불가') && attrs.smoking && attrs.smoking !== '비흡연') {
    dealBreakerTriggered = true;
    missedReasons.push(`⚠️ 흡연자 불가 조건 충돌 (${attrs.smoking})`);
  }
  if (breakers.includes('종교 있음 불가') && attrs.religion && attrs.religion !== '무교') {
    dealBreakerTriggered = true;
    missedReasons.push(`⚠️ 무교 필수 조건 충돌 (${attrs.religion})`);
  }
  if (
    breakers.includes('술 좋아하는 사람 불가') &&
    (attrs.drinking === '주 1~2회 즐김' || attrs.drinking === '애주가')
  ) {
    dealBreakerTriggered = true;
    missedReasons.push(`⚠️ 음주 빈도 조건 충돌 (${attrs.drinking})`);
  }

  let finalPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 70;
  if (dealBreakerTriggered) {
    finalPercent = Math.max(20, finalPercent - 35);
  }

  return {
    percent: Math.min(100, finalPercent),
    matchedReasons,
    missedReasons,
    dealBreakerTriggered
  };
}

/**
 * 두 이성 매물 간의 양방향(Mutual) 궁합을 계산합니다.
 */
export function calculateMutualMatch(profileA, profileB) {
  const aToB = evaluateDirectionalMatch(profileA, profileB);
  const bToA = evaluateDirectionalMatch(profileB, profileA);

  // 양방향 조화 평균(Harmonic Mean)에 가깝게 계산하여 한쪽만 일방적으로 높은 경우보다 쌍방 일치 시 높은 점수 부여
  const harmonic =
    aToB.percent + bToA.percent > 0
      ? Math.round((2 * aToB.percent * bToA.percent) / (aToB.percent + bToA.percent))
      : 0;

  return {
    mutualPercent: harmonic,
    aToB,
    bToA,
    isHighMatch: harmonic >= 80 && !aToB.dealBreakerTriggered && !bToA.dealBreakerTriggered
  };
}
