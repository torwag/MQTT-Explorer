import * as React from 'react'
import { connect } from 'react-redux'
import * as q from '../../../../backend/src/Model'
import { withStyles, Theme } from '@material-ui/core'
import { TopicViewModel } from '../../TopicViewModel'
const debounce = require('lodash.debounce')

export interface TreeNodeProps extends React.HTMLAttributes<HTMLElement> {
  treeNode: q.TreeNode<TopicViewModel>
  name?: string | undefined
  collapsed?: boolean | undefined
  classes: any
  didSelectNode: any
  toggleCollapsed: any
}

class TreeNodeTitle extends React.Component<TreeNodeProps, {}> {
  public render() {
    const { classes, treeNode, style, className } = this.props
    return (
      <span
        className={`${classes.title} ${className}`}
        style={style}
      >
        <span className={classes.expander} onClick={this.props.toggleCollapsed}>{this.renderExpander()}</span>
        {this.renderSourceEdge()} {this.renderCollapsedSubnodes()} {this.renderValue()}
      </span>
    )
  }

  private renderSourceEdge() {
    const name = this.props.name || (this.props.treeNode.sourceEdge && this.props.treeNode.sourceEdge.name)

    return <span className={this.props.classes.sourceEdge}>{name}</span>
  }

  private renderValue() {
    return this.props.treeNode.message && this.props.treeNode.message.length > 0
      ? <span className={this.props.classes.value}> = {this.props.treeNode.message.value.toString().slice(0, 120)}</span>
      : null
  }

  private renderExpander() {
    if (this.props.treeNode.edgeCount() === 0) {
      return null
    }

    return this.props.collapsed ? '▶' : '▼'
  }

  private renderCollapsedSubnodes() {
    if (this.props.treeNode.edgeCount() === 0 || !this.props.collapsed) {
      return null
    }

    const messages = this.props.treeNode.leafMessageCount()
    return <span className={this.props.classes.collapsedSubnodes}>({this.props.treeNode.childTopicCount()} topics, {messages} messages)</span>
  }
}

const styles = (theme: Theme) => ({
  value: {
    whiteSpace: 'nowrap' as 'nowrap',
    overflow: 'hidden' as 'hidden',
    textOverflow: 'ellipsis' as 'ellipsis',
    padding: '0',
  },
  sourceEdge: {
    fontWeight: 'bold' as 'bold',
    overflow: 'hidden' as 'hidden',
  },
  expander: {
    color: theme.palette.type === 'light' ? '#222' : '#eee',
    cursor: 'pointer' as 'pointer',
    paddingRight: theme.spacing(0.25),
  },
  title: {
    borderRadius: '4px',
    lineHeight: '1em',
    display: 'inline-block' as 'inline-block',
    whiteSpace: 'nowrap' as 'nowrap',
    padding: '1px 4px 0px 4px',
    height: '14px',
    margin: '1px 0px 2px 0px',
  },
  collapsedSubnodes: {
    color: theme.palette.text.secondary,
  },
})

export default withStyles(styles)(TreeNodeTitle)
