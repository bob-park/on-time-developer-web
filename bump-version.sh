#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# package.json 파일 경로
PACKAGE_JSON="package.json"

# package.json 파일이 존재하는지 확인
if [ ! -f "$PACKAGE_JSON" ]; then
    echo -e "${RED}Error: package.json 파일을 찾을 수 없습니다.${NC}"
    exit 1
fi

# jq가 설치되어 있는지 확인
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq가 설치되어 있지 않습니다. 'brew install jq' 또는 'npm install -g jq' 로 설치해주세요.${NC}"
    exit 1
fi

# 현재 버전 추출
current_version=$(jq -r '.version' "$PACKAGE_JSON")

if [ -z "$current_version" ] || [ "$current_version" = "null" ]; then
    echo -e "${RED}Error: 버전 정보를 찾을 수 없습니다.${NC}"
    exit 1
fi

echo -e "${YELLOW}현재 버전: $current_version${NC}"

# 버전 파싱 (예: 0.1.1-rc1-20260122)
if [[ $current_version =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)-rc([0-9]+)-([0-9]{8})$ ]]; then
    major=${BASH_REMATCH[1]}
    minor=${BASH_REMATCH[2]}
    patch=${BASH_REMATCH[3]}
    rc_num=${BASH_REMATCH[4]}
    date_part=${BASH_REMATCH[5]}
else
    echo -e "${RED}Error: 버전 형식이 올바르지 않습니다. (예: 0.1.0-rc1-20260121)${NC}"
    exit 1
fi

# 오늘 날짜
today=$(date +%Y%m%d)

# 버전 업데이트 타입 결정
update_type=${1:-patch}

case $update_type in
    "patch")
        if [ "$date_part" = "$today" ]; then
            # 같은 날짜면 RC 번호만 증가
            new_rc_num=$((rc_num + 1))
            new_version="${major}.${minor}.${patch}-rc${new_rc_num}-${today}"
        else
            # 다른 날짜면 patch 버전 증가, RC는 1로 리셋
            new_patch=$((patch + 1))
            new_version="${major}.${minor}.${new_patch}-rc1-${today}"
        fi
        ;;
    "minor")
        # 날짜와 무관하게 minor 버전 증가, patch는 0으로, RC는 1로 리셋
        new_minor=$((minor + 1))
        new_version="${major}.${new_minor}.0-rc1-${today}"
        ;;
    "major")
        # 날짜와 무관하게 major 버전 증가, minor, patch는 0으로, RC는 1로 리셋
        new_major=$((major + 1))
        new_version="${new_major}.0.0-rc1-${today}"
        ;;
    "date")
        if [ "$date_part" = "$today" ]; then
            # 같은 날짜면 RC 번호만 증가
            new_rc_num=$((rc_num + 1))
            new_version="${major}.${minor}.${patch}-rc${new_rc_num}-${today}"
        else
            # 다른 날짜면 날짜만 업데이트, RC는 1로 리셋
            new_version="${major}.${minor}.${patch}-rc1-${today}"
        fi
        ;;
    *)
        echo -e "${RED}Error: 잘못된 업데이트 타입입니다. [patch|minor|major|date]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}새로운 버전: $new_version${NC}"

# package.json 파일의 버전 업데이트
jq --arg version "$new_version" '.version = $version' "$PACKAGE_JSON" > "$PACKAGE_JSON.tmp" && mv "$PACKAGE_JSON.tmp" "$PACKAGE_JSON"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 버전이 성공적으로 업데이트되었습니다!${NC}"
    echo -e "${YELLOW}$current_version → $new_version${NC}"
else
    echo -e "${RED}Error: package.json 업데이트에 실패했습니다.${NC}"
    exit 1
fi

