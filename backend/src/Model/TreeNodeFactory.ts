import { Edge, Tree, TreeNode } from './'

interface HasLength {
  length: number
}

export abstract class TreeNodeFactory {
  public static insertNodeAtPosition<ViewModel>(edgeNames: string[], node: TreeNode<ViewModel>) {
    let currentNode: TreeNode<ViewModel> = new Tree()
    let edge
    for (const edgeName of edgeNames) {
      edge = new Edge<ViewModel>(edgeName)
      currentNode.addEdge(edge)
      currentNode = new TreeNode(edge)
      edge.target = currentNode
    }
    node.sourceEdge = edge
    node.sourceEdge!.target = node
  }

  public static fromEdgesAndValue<ViewModel, T extends HasLength>(edgeNames: string[], value?: T): TreeNode<ViewModel> {
    const node = new TreeNode<ViewModel>()
    node.setMessage({
      value,
      length: value ? value.length : 0,
      received: new Date(),
    })

    this.insertNodeAtPosition<ViewModel>(edgeNames, node)

    return node
  }
}
