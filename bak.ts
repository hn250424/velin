
/** */


* TabDataManager
tabByPath, isTabExist // with tests

* renderer.ts
contextmenu - tab & treenode
tree selected
focused


* 진행
- 트리매니저
- 에딧핸들러, 트리 단축키 & 딜리트 추가(e로 올 때 텍스트 뭐로 오지?)
- 파일핸들러, 오픈디렉토리
- 렌더러.ts에 tree 관련 이벤트 정립

* 디렉토리 감지
FileSystem.watch || chokidar
import chokidar from 'chokidar'

const watcher = chokidar.watch('/your/root/path', {
    ignored: /(^|[\/\\])\../, // dotfiles 무시
    persistent: true,
})

watcher
  .on('add', path => console.log(`File ${path} has been added`))
  .on('change', path => console.log(`File ${path} has been changed`))
  .on('unlink', path => console.log(`File ${path} has been removed`))
  .on('addDir', path => console.log(`Directory ${path} has been added`))
  .on('unlinkDir', path => console.log(`Directory ${path} has been removed`))

* 비동기 저장 큐 -- 자동저장

* 갑작스러운 종료 - 캐시

* 버퍼 / 디바운싱 - 저장 안 된 파일이 외부에서 수정 시,