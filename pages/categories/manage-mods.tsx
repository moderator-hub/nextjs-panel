import { useEffect, useState } from "react"
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Star as StarIcon, DoNotDisturb as DoNotDisturbIcon } from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import InfiniteScroll from "react-infinite-scroll-component"
import * as yup from "yup"

import { TooltipIconButton, CardWrapper, CheckboxedItem, AreYouSureDialog, PasswordField } from "../../components/common/library"
import { ProtectedPage } from "../../components/templates/page-template"
import { authorizedFetch } from "../../utils/fetcher"
import { useRequestor } from "../../utils/requestor"
import { isEmpty, ModPerm } from "../../utils/other"
import { useAppSelector } from "../../data/hooks"

interface ModeratorData {
  id: number
  username: string
  superuser: boolean
}

interface ModeratorDialogProps {
  data?: ModeratorData
  open: boolean
  onClose: () => void
}

function RemoveModeratorDialog({ data, open, onClose }: ModeratorDialogProps) {
  function confirm() {

    onClose()
  }

  return <AreYouSureDialog
    open={open}
    confirm={confirm}
    cancel={onClose}
  >
    <Typography variant="body1">
      Do you really want to remove moderator {data?.username}?
    </Typography>
    <Typography variant="body1" color="error">
      You won't be able to undo this action
    </Typography>
  </AreYouSureDialog>
}

function schemaFactory(newEntry: boolean) {
  return yup
    .object({
      username: yup.string().max(100).required(),
      password: newEntry ? yup.string().max(100).required() : yup.string().max(100),
    })
    .required()
}

interface EditModeratorDialogProps extends ModeratorDialogProps {
  globalPermissions: ModPerm[]
}

function EditModeratorDialog({ data, open, onClose, globalPermissions }: EditModeratorDialogProps) {
  const newEntry = data === undefined
  const myPerms: undefined | number[] = useAppSelector(state => state.moderator.permissions?.map(item => item.id))

  const [initialPermissions, setInitialPermissions] = useState<number[]>([
    1, 3, 6, 7, 10, 11
  ])  // TODO load from server or via props
  const [permissions, setPermissions] = useState<number[]>(() => initialPermissions)
  const { control, handleSubmit, formState: { errors }, reset: resetForm } = useForm(
    { resolver: yupResolver(schemaFactory(newEntry)), })

  const usernameError = !!errors?.username?.type
  const passwordError = !!errors?.password?.type
  const anyError = usernameError || passwordError

  const errorDescription: string[] = []
  if (anyError) {
    if (usernameError) {
      if (errors?.username?.type === "max") errorDescription.push("Username is too long")
      if (errors?.username?.type === "required") errorDescription.push("Username is required")
    }
    if (passwordError) {
      if (errors?.password?.type === "max") errorDescription.push("Password is too long")
      if (errors?.password?.type === "required") errorDescription.push("Password is required")
    }
  }

  function close() {
    setPermissions(initialPermissions)
    resetForm()
    onClose()
  }

  const submit = handleSubmit((data: any) => {
    if (isEmpty(data.password))
      console.log(data)

    onClose()
  })

  return <Dialog open={open}>
    <DialogTitle>
      {newEntry ? "New" : "Editing"} moderator
      <IconButton
        onClick={close}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Controller
        name="username"
        control={control}
        defaultValue={data?.username}
        render={({ field }) => (
          <TextField
            sx={{ width: "100%", }}
            label="Username"
            error={usernameError}
            fullWidth
            margin="normal"
            {...field}
            ref={null}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <PasswordField
            sx={{ width: "100%", }}
            label="New Password"
            autoComplete="none"
            error={passwordError}
            fullWidth
            margin="normal"
            {...field}
            ref={null}
          />
        )}
      />
      {anyError && errorDescription
        .map((item, key) => <Typography
          sx={{ mt: 1 }}
          variant="body1"
          color="error"
          key={key}
        >
          {item}
        </Typography>)
      }
      <Paper sx={{ mt: 2, overflowY: "auto", maxHeight: 300 }}>
        <Stack
          direction="column"
          justifyItems="center"
          alignItems="center"
        >
          {globalPermissions.map((perm, key) =>
            <CheckboxedItem
              key={key}
              disabled={!myPerms?.includes(perm.id)}
              disabledText="Can't edit this permission"
              fullWidth
              text={perm.name}
              checked={permissions.includes(perm.id)}
              setChecked={(value) => {
                if (value) setPermissions([perm.id, ...permissions])
                else setPermissions(permissions.filter((v) => v !== perm.id))
              }}
            />
          )}
        </Stack>
      </Paper>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submit}
      >
        {newEntry ? "Create" : "Save"}
      </Button>
    </DialogContent>
  </Dialog>
}

const cardHeight: number = 60

interface ModeratorCardProps {
  data: ModeratorData
  globalPermissions: ModPerm[]
}

function SuperuserCard({ data }: ModeratorCardProps) {
  return <Tooltip title="Use CLI to edit superusers">
    <Paper>
      <Stack direction="row" spacing={1} sx={{ p: 1, alignItems: "center", justifyContent: "center", height: cardHeight }}>
        <StarIcon color="warning" />
        <Typography flexGrow={1} variant="body1">
          {data.username}
        </Typography>
        <DoNotDisturbIcon color="error" />
      </Stack>
    </Paper>
  </Tooltip>
}

function ModeratorCard({ data, globalPermissions }: ModeratorCardProps) {
  const [hover, setHover] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [removing, setRemoving] = useState<boolean>(false)

  return <>
    <RemoveModeratorDialog data={data} open={removing} onClose={() => setRemoving(false)} />
    <EditModeratorDialog data={data} open={editing} onClose={() => setEditing(false)} globalPermissions={globalPermissions} />
    <Paper
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: 1, alignItems: "center", justifyContent: "center", height: cardHeight }}
      >
        {hover && <TooltipIconButton
          onClick={() => setEditing(true)}
          title="Edit Permissions"
          Icon={EditIcon}
        />}
        <Typography
          variant="body1"
          flexGrow={1}
          sx={{ p: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        >
          {data.username}
        </Typography>
        {hover && <TooltipIconButton
          onClick={() => setRemoving(true)}
          title="Remove Moderator"
          Icon={DeleteIcon}
        />}
      </Stack>
    </Paper>
  </>
}

function ModeratorCardSwitch(props: ModeratorCardProps) {
  if (props.data.superuser) return <SuperuserCard {...props} />
  return <ModeratorCard {...props} />
}

export default function ManageMods() {
  const { data: globalPermissions, code: code1 } = useRequestor("/permissions/")
  const [moderators, setModerators] = useState<ModeratorData[]>([])
  const [hasNext, setHasNext] = useState<boolean>(false)

  const [creating, setCreating] = useState<boolean>(false)

  function loadMore() {
    authorizedFetch("/moderators/?offset=" + moderators.length.toString()).then(
      (response) => {
        if (response.ok) response.json().then(({ results, "has-next": hasMore }: any) => {
          setModerators([...moderators, ...results])
          setHasNext(hasMore)
        })
      }
    )
  }
  useEffect(loadMore, [setModerators, setHasNext])

  return <ProtectedPage code={code1} title="Moderator Management | MUB">
    <EditModeratorDialog open={creating} onClose={() => setCreating(false)} globalPermissions={globalPermissions} />
    <Stack sx={{ maxWidth: 1200, width: "100%", m: "auto", py: 4, px: 2, textAlign: "center" }} direction="column">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Superuser: Moderator Management
      </Typography>
      {moderators !== undefined &&
        <InfiniteScroll
          dataLength={moderators.length}
          next={loadMore}
          hasMore={hasNext === true}
          loader={<h4>Loading...</h4>}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <CardWrapper height={cardHeight} onClick={() => setCreating(true)}>
                <AddIcon />
              </CardWrapper>
            </Grid>
            {(moderators)?.map(
              (data, index) => <Grid item xs={3} key={index}>
                <ModeratorCardSwitch data={data} globalPermissions={globalPermissions} />
              </Grid>
            )}
          </Grid>
        </InfiniteScroll>
      }
    </Stack>
  </ProtectedPage >
}