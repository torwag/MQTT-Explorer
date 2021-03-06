import * as q from '../../../../backend/src/Model'
import * as React from 'react'
import Clear from '@material-ui/icons/Clear'
import Copy from '../Copy'
import CustomIconButton from '../CustomIconButton'
import DateFormatter from '../helper/DateFormatter'
import Delete from '@material-ui/icons/Delete'
import DeleteForever from '@material-ui/icons/DeleteForever'
import ExpandMore from '@material-ui/icons/ExpandMore'
import MessageHistory from './MessageHistory'
import NodeStats from './NodeStats'
import Topic from './Topic'
import { AppState } from '../../reducers'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { default as ReactResizeDetector } from 'react-resize-detector'
import { sidebarActons } from '../../actions'
import { StyleRulesCallback, Theme, withStyles } from '@material-ui/core/styles'
import { TopicViewModel } from '../../TopicViewModel'

import {
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Fade,
  Paper,
  Popper,
  Typography,
  Tooltip,
  Badge,
} from '@material-ui/core'

const throttle = require('lodash.throttle')

const Publish = React.lazy(() => import('./Publish/Publish'))
const ValueRenderer = React.lazy(() => import('./ValueRenderer'))

interface Props {
  node?: q.TreeNode<TopicViewModel>,
  actions: typeof sidebarActons,
  classes: any,
  connectionId?: string,
}

interface State {
  node: q.TreeNode<TopicViewModel>
  compareMessage?: q.Message
  valueRenderWidth: number
}

class Sidebar extends React.Component<Props, State> {
  private valueRef: any = React.createRef<HTMLDivElement>()
  private updateNode = throttle(() => {
    this.setState(this.state)
  }, 300)

  constructor(props: any) {
    super(props)
    console.error('Find and fix me #state')
    this.state = { node: new q.Tree(), valueRenderWidth: 300 }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.props.node && this.removeUpdateListener(this.props.node)
    nextProps.node && this.registerUpdateListener(nextProps.node)
    this.props.node && this.setState({ node: this.props.node })

    if (this.props.node !== nextProps.node) {
      this.setState({ compareMessage: undefined })
    }
  }

  public componentWillUnmount() {
    this.props.node && this.removeUpdateListener(this.props.node)
  }

  private registerUpdateListener(node: q.TreeNode<TopicViewModel>) {
    node.onMerge.subscribe(this.updateNode)
    node.onMessage.subscribe(this.updateNode)
  }

  private removeUpdateListener(node: q.TreeNode<TopicViewModel>) {
    node.onMerge.unsubscribe(this.updateNode)
    node.onMessage.unsubscribe(this.updateNode)
  }

  public render() {
    return (
      <div className={this.props.classes.drawer}>
        {this.renderNode()}
      </div>
    )
  }

  private detailsStyle = { padding: '0px 16px 8px 8px', display: 'block' }

  private renderTopicDeleteButton() {
    if (!this.props.node) {
      return null
    }

    return (
      <CustomIconButton onClick={() => this.deleteTopic(this.props.node)}>
        <Tooltip title="Clear this topic">
          <Delete />
        </Tooltip>
      </CustomIconButton>
    )
  }

  private renderRecursiveTopicDeleteButton() {
    const deleteLimit = 50
    const topicCount = this.props.node ? this.props.node.childTopicCount() : 0
    if (!this.props.node || topicCount === 0) {
      return null
    }

    return (
      <CustomIconButton onClick={() => this.deleteTopic(this.props.node, true, deleteLimit)}>
        <Tooltip title={`Deletes up to ${deleteLimit} sub-topics with a single click`}>
          <Badge
            classes={{ badge: this.props.classes.badge }}
            badgeContent={<span style={{ whiteSpace: 'nowrap' }}>{topicCount >= deleteLimit ? '50+' : topicCount}</span>}
            color="secondary"
          >
            <DeleteForever color="action" />
          </Badge>
        </Tooltip>
      </CustomIconButton>
    )
  }

  private deleteTopic = (topic?: q.TreeNode<TopicViewModel>, recursive: boolean = false, maxCount = 50) => {
    if (!topic) {
      return
    }

    this.props.actions.clearTopic(topic, recursive, maxCount)
  }

  private renderNode() {
    const { classes, node } = this.props

    const copyTopic = node ? <Copy value={node.path()} /> : null
    const deleteTopic = this.renderTopicDeleteButton()
    const deleteRecursiveTopic = this.renderRecursiveTopicDeleteButton()
    const copyValue = node && node.message ? <Copy value={node.message.value} /> : null
    const summeryStyle = { minHeight: '0' }
    return (
      <div>
        <ExpansionPanel key="topic" defaultExpanded={true} disabled={!Boolean(this.props.node)}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Topic {copyTopic} {deleteTopic} {deleteRecursiveTopic}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <Topic node={this.props.node} didSelectNode={this.updateNode} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel key="value" defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Value {copyValue}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            {this.messageMetaInfo()}
            <div ref={this.valueRef}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ValueRenderer node={this.props.node} compareWith={this.state.compareMessage} />
            </React.Suspense>
            </div>
            <div><MessageHistory onSelect={this.handleMessageHistorySelect} selected={this.state.compareMessage} node={this.props.node} /></div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={true}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Publish</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={this.detailsStyle}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Publish node={this.props.node} connectionId={this.props.connectionId} />
            </React.Suspense>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded={Boolean(this.props.node)}>
          <ExpansionPanelSummary expandIcon={<ExpandMore />} style={summeryStyle}>
            <Typography className={classes.heading}>Stats</Typography>
          </ExpansionPanelSummary>
          {this.renderNodeStats()}
        </ExpansionPanel>
      </div>
    )
  }

  private messageMetaInfo() {
    if (!this.props.node || !this.props.node.message || !this.props.node.mqttMessage) {
      return null
    }

    const retainedButton = (
      <Tooltip title="Delete retained topic" placement="top">
        <Button
          size="small"
          color="secondary"
          variant="contained"
          style={{ marginTop: '-3px', padding: '0px 4px', minHeight: '24px' }}
          onClick={this.props.actions.clearRetainedTopic}
        >
          retained <Clear style={{ fontSize: '16px', marginLeft: '2px' }} />
        </Button>
      </Tooltip>
    )

    return (
      <div style={{ width: '100%', display: 'flex' }}>
        <div style={{ flex: 6 }}><Typography>QoS: {this.props.node.mqttMessage.qos}</Typography></div>
        <div style={{ flex: 8, textAlign: 'center' }}>
          {this.props.node.mqttMessage.retain ? retainedButton : null}
        </div>
        <div style={{ flex: 8, textAlign: 'right' }}><Typography><i><DateFormatter date={this.props.node.message.received} /></i></Typography></div>
      </div>
    )
  }

  private handleMessageHistorySelect = (message: q.Message) => {
    if (message !== this.state.compareMessage) {
      this.setState({ compareMessage: message })
    } else {
      this.setState({ compareMessage: undefined })
    }
  }

  private renderNodeStats() {
    if (!this.props.node) {
      return null
    }

    return (
      <ExpansionPanelDetails style={this.detailsStyle}>
        <NodeStats node={this.props.node} />
      </ExpansionPanelDetails>
    )
  }
}

const mapStateToProps = (state: AppState) => {
  return {
    node: state.tree.selectedTopic,
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: bindActionCreators(sidebarActons, dispatch),
  }
}

const styles: StyleRulesCallback<string> = (theme: Theme) => {
  return {
    drawer: {
      display: 'block',
      height: '100%',
    },
    valuePaper: {
      margin: theme.spacing(1),
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Sidebar))
