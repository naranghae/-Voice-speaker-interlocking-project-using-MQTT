### -Voice-speaker-interlocking-project-using-MQTT

## Rest api, 비동기 통신, MQTT, 날씨 api 정보, 필립스 휴 연동 인스턴스인 5개의 aws 가상환경을 구축하여 MQTT를 이용한 연동 프로젝트이다.

## 세팅
# 1. Aws 로그인
먼저 컴퓨팅에서 EC2를 클릭한 후 AWS 프리티어 instance를 생성한다.
프리티어 사용 가능한 Ubuntu Server 18.04 LTS 를 선택하였다.
환경변수 설정: 고급 시스템 설정-> 환경변수 path에 주소넣기

# 2. putty실행
Puttygen을 클릭하여  `*.pem 필요(awspassword)`
aws pen key 파일을 ppk 파일로 변환
생성된 ppk로 aws instance ssh 접속
login as: ubuntu

# 3. SSH key 생성
ssh-keygen이라 친다.
.ssh 폴더에서 id_rsa.pub 파일을 메모장으로 열어서 그 안에 내용을 복사한다.
생성한 aws instance에서 authorized_keys 파일에 클립보드에 복사한 key값을 복사한다.
vs code의 파워셀로 ssh 접속 확인 (ssh ubuntu@ip주소)

# 4. VScode setting
Vscode sshfs 플러그인 설치
Vscode sshfs 환경설정에서 settings.json 파일을 수정한다.
(host, privateKeyPath, name)


## 프로젝트 흐름도
![텍스트](D:\Image 1.png)
```
EC2_1 UI (FE:html +javascript or vue   BE: node.js+express)
Pub(EC2_2에게 on/off 명령을 내림)
Pub(EC2_3에게 날씨정보를 물어봄)
sub(EC2_3에게 날씨정보 받음)

EC2_2 philips (node.js)
sub(EC2_4에서 명령을 받음)
sub(EC2_1에게 명령을 받음) 

EC2_3 wheather(node.js)
sub (EC2_1에게 날씨정보를 물어본 것을 받음)
Pub(EC2_1에게 날씨정보 제공)
sub(EC2_4에게 물음을 받음)
Pub(EC2_4에게 날씨정보 제공)

EC2_4 음성스피커(node.js)
pub(EC2_2에게 조명제어 명령을 내림)
pub(EC2_3에게 날씨정보를 물어봄)
sub(EC2_3에게 날씨정보를 받음)

EC2_5 MQTT(MQTT or RabbitMQ) -> MQTT 사용
Broker  
```
