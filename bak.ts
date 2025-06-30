clean(container: HTMLElement) {
    while (container.firstChild) {
        container.removeChild(container.firstChild)
    }
}

safeIdFromPath(path: string): string {
    return 'node-' + path.replace(/[^\w\-]/g, '_')
}

setTreeData(parentPath: string | null, children: TreeNode[]) {
    let container: HTMLElement

    if (parentPath === null) {
        // 루트에 그리는 경우
        container = this._tree_content
        this.clean(container)
    } else {
        const parentId = this.safeIdFromPath(parentPath)
        const parentWrapper = document.getElementById(parentId)?.closest('.tree_node_wrapper')
        container = parentWrapper?.querySelector('.tree_children') as HTMLElement
        if (!container) return
        container.innerHTML = ''  // 혹시 이전 자식이 남아있다면 정리
    }

    for (const child of children) {
        this.renderNode(container, child)
    }
}

renderNode(container: HTMLElement, node: TreeNode) {
    const box = document.createElement('div')
    box.classList.add('tree_node')
    box.style.paddingLeft = `${(node.indent - 1) * 16}px`
    box.id = this.safeIdFromPath(node.path)
    box.title = node.path

    const openStatus = document.createElement('span')
    openStatus.classList.add('tree_node_open_status')
    if (node.directory) openStatus.textContent = node.isExpanded ? '▽' : '▷'

    const icon = document.createElement('img')
    icon.classList.add('tree_node_icon')
    icon.src = node.directory
        ? new URL('../../assets/icons/setting.png', import.meta.url).toString()
        : new URL('../../assets/icons/file.png', import.meta.url).toString()

    const text = document.createElement('span')
    text.classList.add('tree_node_text', 'ellipsis')
    text.textContent = node.name

    // 📦 컨테이너 구조로 만들기 위해 자식용 DIV 준비
    const childrenContainer = document.createElement('div')
    childrenContainer.classList.add('tree_children')
    childrenContainer.style.display = node.isExpanded ? 'block' : 'none'

    // 붙이기
    box.appendChild(openStatus)
    box.appendChild(icon)
    box.appendChild(text)

    const wrapper = document.createElement('div')
    wrapper.classList.add('tree_node_wrapper')
    wrapper.appendChild(box)
    wrapper.appendChild(childrenContainer)

    container.appendChild(wrapper)
}



/** */


* TabDataManager
tabByPath, isTabExist // with tests

* TreeNode
expanded 

* TreeManager
clean param target

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