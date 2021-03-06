import * as React from 'react'
import { Snackbar, SnackbarContent, Tooltip } from '@material-ui/core'
import FileCopy from '@material-ui/icons/FileCopy'
import Check from '@material-ui/icons/Check'
import green from '@material-ui/core/colors/green'
import { withStyles, Theme } from '@material-ui/core/styles'
import CustomIconButton from './CustomIconButton';

const copy = require('copy-text-to-clipboard')

interface Props {
  value: string
  classes: any
}

interface State {
  didCopy: boolean
  snackBarOpen: boolean
}

const styles = (theme: Theme) => ({
  snackbar: {
    backgroundColor: green[600],
    color: theme.typography.button.color,
  },
})

class Copy extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { didCopy: false, snackBarOpen: false }
  }

  public render() {
    const icon = !this.state.didCopy
      ? <FileCopy fontSize="inherit" />
      : <Check fontSize="inherit" style={{ cursor: 'default' }} />

    return (
      <span>
        <Tooltip placement="top" title="Copy to clipboard">
          <span style={{ fontSize: '16px' }}>
          <CustomIconButton onClick={this.handleClick} >
            {icon}
          </CustomIconButton>
          </span>
        </Tooltip>
        <span>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.snackBarOpen}
            autoHideDuration={2000}
            onClose={() => { this.setState({ snackBarOpen: false }) }}
          >
            <SnackbarContent
              className={this.props.classes.snackbar}
              message="Copied to clipboard"
            />
          </Snackbar>
        </span>
      </span>
    )
  }

  private handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()

    copy(this.props.value)
    this.setState({ didCopy: true, snackBarOpen: true })
    setTimeout(() => {
      this.setState({ didCopy: false })
    }, 1500)
  }
}

export default withStyles(styles)(Copy)
