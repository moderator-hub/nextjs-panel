import { Button, Card, CardActionArea, CardContent, CardProps, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, ListItemIcon, ListItemText, MenuItem, MenuItemProps, Stack, TextField, TextFieldProps, Tooltip, Typography } from "@mui/material"
import { ReactNode, useState, MouseEvent, ReactChild, ReactFragment, ReactPortal } from "react"
import { SvgIconComponent, VisibilityOff as VisibilityOffIcon, Visibility as VisibilityOnIcon } from "@mui/icons-material"

export function PasswordField(props: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  return <TextField
    type={showPassword ? "text" : "password"}
    {...props}
    InputProps={{
      endAdornment: <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
        </IconButton>
      </InputAdornment>,
      ...props.InputProps
    }}
  />
}

export interface CardWrapperProps extends CardProps {
  height?: number
  children?: ReactNode,
  cardProps?: any
  cardContentProps?: any
  cardActionAreaProps?: any
}

export function CardWrapper({ children, height, onClick, cardActionAreaProps, cardContentProps, ...cardProps }: CardWrapperProps) {
  return <Card {...cardProps}>
    <CardActionArea sx={{ height }} onClick={onClick} {...cardActionAreaProps}>
      <CardContent {...cardContentProps}>
        {children}
      </CardContent>
    </CardActionArea>
  </Card>
}

export interface IconMenuItemProps extends MenuItemProps {
  text: string
  Icon: SvgIconComponent
  handleClose: (e: MouseEvent) => void
}

export function IconMenuItem({ onClick, handleClose, Icon, text }: IconMenuItemProps) {
  return <MenuItem onClick={(e) => {
    if (onClick) onClick(e)
    handleClose(e)
  }}>
    <ListItemIcon>
      <Icon fontSize="small" />
    </ListItemIcon>
    <ListItemText>{text}</ListItemText>
  </MenuItem>
}

export interface TooltipIconButtonProps {
  title?: boolean | ReactChild | ReactFragment | ReactPortal
  Icon?: SvgIconComponent
  onClick?: () => void
}

export function TooltipIconButton({ title, Icon, onClick }: TooltipIconButtonProps) {
  return <Tooltip title={title ? title : ""}>
    <IconButton onClick={onClick}>
      {Icon !== undefined && <Icon fontSize="small" />}
    </IconButton>
  </Tooltip>
}

interface CheckboxedItemProps {
  text: string
  disabled?: boolean
  disabledText?: string
  fullWidth: boolean
  checked: boolean
  setChecked: (v: boolean) => void
}

export function CheckboxedItem({ text, disabled, disabledText = "", fullWidth, checked, setChecked }: CheckboxedItemProps) {
  return <Stack
    sx={{ px: 2 }}
    width={fullWidth ? "100%" : ""}
    direction="row"
    justifyContent="center"
    justifyItems="center"
    alignItems="center"
    alignContent="center"
  >
    <Typography variant="body1" flexGrow={fullWidth ? 1 : 0}>
      {text}
    </Typography>
    <Tooltip title={disabled ? disabledText : ""} placement="left">
      <div>
        <Checkbox
          disabled={disabled}
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      </div>
    </Tooltip>
  </Stack >
}

interface AreYouSureDialogProps {
  open: boolean
  children?: ReactNode
  confirm: () => void
  cancel: () => void
}

export function AreYouSureDialog({ open, children, confirm, cancel }: AreYouSureDialogProps) {
  return <Dialog open={open}>
    <DialogTitle>
      Confirmation
    </DialogTitle>
    <DialogContent>
      {children}
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        onClick={confirm}
      >
        Yes
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={cancel}
      >
        No
      </Button>
    </DialogActions>
  </Dialog>
}
